package com.showtime.movie;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final TmdbMovieMapper tmdbMovieMapper;
    private final TmdbClientService tmdbClientService;
    private final MongoTemplate mongoTemplate;

    public Movie upsertMovie(Long tmdbId) {
        TmdbMovieResponse tmdbMovieResponse = tmdbClientService.fetchMovieDetails(tmdbId);
        if (tmdbMovieResponse == null) {
            throw new TmdbSyncException("TMDB returned an empty response for movie id " + tmdbId, 0);
        }

        TmdbCreditResponse tmdbCreditResponse = tmdbClientService.fetchCreditDetails(tmdbId);
        if (tmdbCreditResponse == null || tmdbCreditResponse.getCast() == null) {
            throw new TmdbSyncException("TMDB returned an empty credits response for movie id " + tmdbId, 0);
        }

        List<Cast> castList = tmdbMovieMapper.toCastList(tmdbCreditResponse.getCast());
        Optional<Movie> findMovie = movieRepository.findByTmdbId(Long.toString(tmdbId));
        Movie upsertMovie;
        if (findMovie.isPresent()) {
            tmdbMovieMapper.updateMovieFromTmdb(tmdbMovieResponse, findMovie.get());
            upsertMovie = findMovie.get();
        } else {
            upsertMovie = tmdbMovieMapper.toMovie(tmdbMovieResponse);
        }
        upsertMovie.setCast(castList);
        return movieRepository.save(upsertMovie);
    }

    public List<MovieBatchItemResult> upsertMovies(List<Long> tmbdIds) {
        List<MovieBatchItemResult> results = new ArrayList<>();
        for (Long tmbId : tmbdIds) {
            try{
                Movie res = upsertMovie(tmbId);
                results.add(new MovieBatchItemResult.Success(tmbId, res.getMovieId(), res.getTitle()));
            }catch (Exception e){
                results.add(new MovieBatchItemResult.Failure(tmbId, e.getMessage()));
            }
        }
        return results;
    }

    public Page<Movie> getMoviesPaginated(String title, Pageable pageable) {
        Criteria criteria = new Criteria();
        if (title != null && !title.isBlank()) {
            criteria.and("title").regex(Pattern.quote(title.trim()), "i");
        }
        Query query = new Query(criteria);
        long total = mongoTemplate.count(query, Movie.class);
        List<Movie> movies = mongoTemplate.find(query.with(pageable), Movie.class);
        return new PageImpl<>(movies, pageable, total);
    }

    public List<MovieCatalogResponse> searchMovieForUser(String title, List<String> genre){
        Criteria criteria = new Criteria();

        if(title != null && !title.isBlank()){
            criteria.and("title").regex(title, "i");
        }
        if(genre != null && !genre.isEmpty()){
            criteria.and("genre").in(genre);
        }
        criteria.and("status").is(MovieStatus.SCHEDULABLE);
        Query query = new Query(criteria);
        List<Movie> movies = mongoTemplate.find(query, Movie.class);
        return movies.stream()
                .map(tmdbMovieMapper::toCatalogResponse)
                .toList();
    }

    public List<MovieSummaryResponse> searchMoviesForStaff(String title, List<MovieStatus> status){
        Criteria criteria = new Criteria();
        if(title != null && !title.isBlank()){
            criteria.and("title").regex(title, "i");
        }
        if(status != null && !status.isEmpty()){
            criteria.and("status").in(status);
        }
        Query query = new Query(criteria);
        List<Movie> movies = mongoTemplate.find(query, Movie.class);
        return movies.stream()
                .map(tmdbMovieMapper::toSummaryResponse)
                .toList();
    }

    public MovieDetailResponse getMovieById(String movieId) {
        return tmdbMovieMapper.toDetailResponse(getEntityById(movieId));
    }

    public Movie getEntityById(String movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));
    }
}
