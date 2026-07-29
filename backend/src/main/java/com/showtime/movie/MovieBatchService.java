package com.showtime.movie;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MovieBatchService {
    private final MongoTemplate mongoTemplate;
    private final MovieMapper movieMapper;

    public MovieBatchResponse createBatch(BulkCreateMovieRequest request) {
        List<MovieBatchItemResult> failures = new ArrayList<>();
        BatchFilterResult inBatchFilterResult = divideRequest(request);
        BatchFilterResult dbFilterResult = checkDuplicateInDb(inBatchFilterResult);
        failures.addAll(inBatchFilterResult.failures());
        failures.addAll(dbFilterResult.failures());
        failures.sort(Comparator.comparing(MovieBatchItemResult::index));
        if(dbFilterResult.clean().isEmpty()){
            return new MovieBatchResponse(failures);
        }
        List<MovieBatchItemResult> succesList = saveClean(dbFilterResult.clean());

        List<MovieBatchItemResult> finalBatchProcessResult =  new ArrayList<>();
        finalBatchProcessResult.addAll(failures);
        finalBatchProcessResult.addAll(succesList);

        finalBatchProcessResult.sort(Comparator.comparing(MovieBatchItemResult::index));
        return new MovieBatchResponse(finalBatchProcessResult);
    }

    private List<MovieBatchItemResult> saveClean(List<IndexedMovie> clean) {
        // Step 1: map each IndexedMovie -> IndexedEntity, carrying the index forward
        List<IndexedEntity> indexedEntities = clean.stream()
                .map(im -> new IndexedEntity(im.index(), movieMapper.toEntity(im.request())))
                .toList();

        // Step 2: extract just the Movie objects, same order, to pass to insertAll
        List<Movie> moviesToInsert = indexedEntities.stream()
                .map(IndexedEntity::movie)
                .toList();

        // Step 3: insertAll — this mutates each Movie object in place, setting its movieId
        mongoTemplate.insertAll(moviesToInsert);

        // Step 4: since the same object references were mutated, we can read movieId
        // straight off indexedEntities now — no need to trust the returned list's order at all
        List<MovieBatchItemResult> successResults = new ArrayList<>();
        for (IndexedEntity entity : indexedEntities) {
            successResults.add(new MovieBatchSuccess(
                    entity.index(),
                    entity.movie().getMovieId(),
                    entity.movie().getTitle()
            ));
        }
        return successResults;
    }
    private BatchFilterResult divideRequest(BulkCreateMovieRequest request) {
        Set<MovieKey> st = new HashSet<>();
        List<MovieBatchItemResult> failureResults = new ArrayList<>();
        List<IndexedMovie> clean = new ArrayList<>();

        for(int i = 0; i < request.getMovies().size(); i++) {
            CreateMovieRequest r =  request.getMovies().get(i);
            MovieKey key = new MovieKey(r.getTitle(), r.getReleaseDate());
            if(!st.contains(key)) {
                clean.add(new IndexedMovie(i, request.getMovies().get(i)));
            }else{
                failureResults.add(
                        new MovieBatchFailure(
                                i,
                                "The movie" + r.getTitle() + " and release date " +
                                        r.getReleaseDate() + " is present more then once in request"
                        )
                );
            }
            st.add(new MovieKey(r.getTitle(), r.getReleaseDate()));
        }
        return new BatchFilterResult(clean, failureResults);
    }

    private BatchFilterResult checkDuplicateInDb(BatchFilterResult filterResult) {
        if(filterResult.clean().isEmpty()){
            return new BatchFilterResult(new ArrayList<>(), filterResult.failures());
        }
        List<Movie> getExistingMovies = buildingQuery(filterResult.clean());
        Set<MovieKey> st = new HashSet<>();
        List<MovieBatchItemResult> failureResults = new ArrayList<>();
        List<IndexedMovie> cleanList = new ArrayList<>();

        for(Movie movie : getExistingMovies) {
            st.add(new MovieKey(movie.getTitle(), movie.getReleaseDate()));
        }
        for(IndexedMovie indexedMovie : filterResult.clean()) {
            MovieKey temp = new MovieKey(indexedMovie.request().getTitle(), indexedMovie.request().getReleaseDate());
            if(st.contains(temp)){
                failureResults.add(new MovieBatchFailure(
                        indexedMovie.index(),
                        "The movie " + indexedMovie.request().getTitle() + " already exists in system"
                ));
            }else{
                cleanList.add(indexedMovie);
            }
        }
        return new BatchFilterResult(cleanList, failureResults);
    }

    public List<Movie> buildingQuery(List<IndexedMovie>  indexedMovies){
        if(indexedMovies == null || indexedMovies.isEmpty()){
            return new ArrayList<>();
        }
        List<Criteria> criteriaList = new ArrayList<>();
        for(IndexedMovie indexedMovie : indexedMovies){
            Criteria criteria = Criteria.where("title").is(indexedMovie.request().getTitle())
                    .and("releaseDate").is(indexedMovie.request().getReleaseDate());
            criteriaList.add(criteria);
        }
        Criteria[] criteria = criteriaList.toArray(Criteria[]::new);
        Criteria combinedCriteria = new Criteria().orOperator(criteria);
        Query query = new Query(combinedCriteria);
        return mongoTemplate.find(query, Movie.class);
    }

}
