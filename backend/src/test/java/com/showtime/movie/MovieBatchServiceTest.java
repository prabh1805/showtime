package com.showtime.movie;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieBatchServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private MovieMapper movieMapper;

    @InjectMocks
    private MovieBatchService movieBatchService;

    private static CreateMovieRequest req(String title, LocalDate releaseDate) {
        CreateMovieRequest request = new CreateMovieRequest();
        request.setTitle(title);
        request.setDuration(120);
        request.setReleaseDate(releaseDate);
        request.setAvailableLanguages(List.of("English"));
        request.setAvailableFormats(List.of(MovieFormat.TWO_D));
        return request;
    }

    private void stubMapperToEntity() {
        when(movieMapper.toEntity(any(CreateMovieRequest.class))).thenAnswer(invocation -> {
            CreateMovieRequest r = invocation.getArgument(0);
            Movie movie = new Movie();
            movie.setTitle(r.getTitle());
            movie.setReleaseDate(r.getReleaseDate());
            return movie;
        });
    }

    @SuppressWarnings("unchecked")
    private void stubInsertAllAssignsMovieId() {
        doAnswer(invocation -> {
            Collection<Movie> movies = invocation.getArgument(0);
            for (Movie movie : movies) {
                movie.setMovieId("id-" + movie.getTitle());
            }
            return movies;
        }).when(mongoTemplate).insertAll(anyCollection());
    }

    private BulkCreateMovieRequest bulkOf(CreateMovieRequest... requests) {
        BulkCreateMovieRequest bulk = new BulkCreateMovieRequest();
        bulk.setMovies(new ArrayList<>(List.of(requests)));
        return bulk;
    }

    @Test
    void createBatch_allUniqueMovies_savesAllAndReturnsSuccessesInOrder() {
        CreateMovieRequest r0 = req("Inception", LocalDate.of(2010, 7, 16));
        CreateMovieRequest r1 = req("Interstellar", LocalDate.of(2014, 11, 7));
        BulkCreateMovieRequest bulk = bulkOf(r0, r1);

        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of());
        stubMapperToEntity();
        stubInsertAllAssignsMovieId();

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).hasSize(2);
        assertThat(response.getResults().get(0)).isInstanceOf(MovieBatchSuccess.class);
        assertThat(response.getResults().get(1)).isInstanceOf(MovieBatchSuccess.class);

        MovieBatchSuccess first = (MovieBatchSuccess) response.getResults().get(0);
        MovieBatchSuccess second = (MovieBatchSuccess) response.getResults().get(1);
        assertThat(first.index()).isEqualTo(0);
        assertThat(first.title()).isEqualTo("Inception");
        assertThat(first.movieId()).isEqualTo("id-Inception");
        assertThat(second.index()).isEqualTo(1);
        assertThat(second.title()).isEqualTo("Interstellar");
        assertThat(second.movieId()).isEqualTo("id-Interstellar");

        verify(mongoTemplate).insertAll(anyCollection());
    }

    @Test
    void createBatch_inBatchDuplicate_firstSavedSecondMarkedFailure() {
        LocalDate releaseDate = LocalDate.of(2010, 7, 16);
        CreateMovieRequest r0 = req("Inception", releaseDate);
        CreateMovieRequest r1 = req("Inception", releaseDate);
        BulkCreateMovieRequest bulk = bulkOf(r0, r1);

        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of());
        stubMapperToEntity();
        stubInsertAllAssignsMovieId();

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).hasSize(2);
        assertThat(response.getResults().get(0)).isInstanceOf(MovieBatchSuccess.class);
        assertThat(response.getResults().get(1)).isInstanceOf(MovieBatchFailure.class);

        MovieBatchFailure failure = (MovieBatchFailure) response.getResults().get(1);
        assertThat(failure.index()).isEqualTo(1);
        assertThat(failure.errorMessage())
                .isEqualTo("The movieInception and release date " + releaseDate + " is present more then once in request");

        // only the first (deduped) occurrence should ever reach the DB duplicate check / insert
        verify(mongoTemplate).insertAll(argThat((Collection<?> c) -> c.size() == 1));
    }

    @Test
    void createBatch_dbDuplicate_marksFailureAndNeverInserts() {
        LocalDate releaseDate = LocalDate.of(2010, 7, 16);
        CreateMovieRequest r0 = req("Inception", releaseDate);
        BulkCreateMovieRequest bulk = bulkOf(r0);

        Movie existing = new Movie();
        existing.setTitle("Inception");
        existing.setReleaseDate(releaseDate);
        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of(existing));

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().get(0)).isInstanceOf(MovieBatchFailure.class);
        MovieBatchFailure failure = (MovieBatchFailure) response.getResults().get(0);
        assertThat(failure.index()).isEqualTo(0);
        assertThat(failure.errorMessage()).isEqualTo("The movie Inception already exists in system");

        verify(mongoTemplate, never()).insertAll(any());
        verifyNoInteractions(movieMapper);
    }

    @Test
    void createBatch_mixedInBatchAndDbDuplicatesAndSuccess_resultsSortedByIndex() {
        LocalDate d1 = LocalDate.of(2010, 7, 16);
        LocalDate d2 = LocalDate.of(2020, 1, 1);
        CreateMovieRequest r0 = req("Inception", d1);      // unique, saved
        CreateMovieRequest r1 = req("Inception", d1);      // in-batch dup of r0
        CreateMovieRequest r2 = req("Tenet", d2);           // unique in-batch, but exists in DB

        BulkCreateMovieRequest bulk = bulkOf(r0, r1, r2);

        Movie existingTenet = new Movie();
        existingTenet.setTitle("Tenet");
        existingTenet.setReleaseDate(d2);
        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of(existingTenet));
        stubMapperToEntity();
        stubInsertAllAssignsMovieId();

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).hasSize(3);
        assertThat(response.getResults().get(0).index()).isEqualTo(0);
        assertThat(response.getResults().get(0)).isInstanceOf(MovieBatchSuccess.class);
        assertThat(response.getResults().get(1).index()).isEqualTo(1);
        assertThat(response.getResults().get(1)).isInstanceOf(MovieBatchFailure.class);
        assertThat(response.getResults().get(2).index()).isEqualTo(2);
        assertThat(response.getResults().get(2)).isInstanceOf(MovieBatchFailure.class);

        MovieBatchSuccess success = (MovieBatchSuccess) response.getResults().get(0);
        assertThat(success.title()).isEqualTo("Inception");
        assertThat(success.movieId()).isEqualTo("id-Inception");

        MovieBatchFailure dbDup = (MovieBatchFailure) response.getResults().get(2);
        assertThat(dbDup.errorMessage()).isEqualTo("The movie Tenet already exists in system");

        verify(mongoTemplate).insertAll(argThat((Collection<?> c) -> c.size() == 1));
    }

    @Test
    void createBatch_allCleanMoviesAreDbDuplicates_returnsOnlyFailuresAndNeverInserts() {
        LocalDate releaseDate = LocalDate.of(2010, 7, 16);
        CreateMovieRequest r0 = req("Inception", releaseDate);
        BulkCreateMovieRequest bulk = bulkOf(r0);

        Movie existing = new Movie();
        existing.setTitle("Inception");
        existing.setReleaseDate(releaseDate);
        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of(existing));

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().get(0)).isInstanceOf(MovieBatchFailure.class);
        verify(mongoTemplate, never()).insertAll(any());
    }

    @Test
    void createBatch_emptyMoviesList_returnsEmptyResponseWithoutTouchingMongo() {
        BulkCreateMovieRequest bulk = bulkOf();

        MovieBatchResponse response = movieBatchService.createBatch(bulk);

        assertThat(response.getResults()).isEmpty();
        verifyNoInteractions(mongoTemplate);
        verifyNoInteractions(movieMapper);
    }

    @Test
    void buildingQuery_withEmptyList_returnsEmptyListWithoutQueryingMongo() {
        List<Movie> result = movieBatchService.buildingQuery(List.of());

        assertThat(result).isEmpty();
        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void buildingQuery_withNull_returnsEmptyListWithoutQueryingMongo() {
        List<Movie> result = movieBatchService.buildingQuery(null);

        assertThat(result).isEmpty();
        verifyNoInteractions(mongoTemplate);
    }

    @Test
    void buildingQuery_withMovies_queriesMongoAndReturnsResult() {
        IndexedMovie indexedMovie = new IndexedMovie(0, req("Inception", LocalDate.of(2010, 7, 16)));
        Movie found = new Movie();
        found.setTitle("Inception");
        when(mongoTemplate.find(any(Query.class), eq(Movie.class))).thenReturn(List.of(found));

        List<Movie> result = movieBatchService.buildingQuery(List.of(indexedMovie));

        assertThat(result).containsExactly(found);
        verify(mongoTemplate).find(any(Query.class), eq(Movie.class));
    }
}
