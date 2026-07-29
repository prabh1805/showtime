package com.showtime.movie;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private MovieMapper movieMapper;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private MovieBatchService movieBatchService;

    @InjectMocks
    private MovieService movieService;

    private CreateMovieRequest request() {
        CreateMovieRequest request = new CreateMovieRequest();
        request.setTitle("Inception");
        request.setDuration(148);
        request.setReleaseDate(LocalDate.of(2010, 7, 16));
        request.setAvailableLanguages(List.of("English"));
        request.setAvailableFormats(List.of(MovieFormat.TWO_D, MovieFormat.THREE_D));
        return request;
    }

    @Test
    void create_newMovie_savesAndReturnsMappedResponse() {
        CreateMovieRequest request = request();
        Movie entity = new Movie();
        entity.setTitle("Inception");
        Movie saved = new Movie();
        saved.setMovieId("m1");
        saved.setTitle("Inception");
        MovieResponse expectedResponse = new MovieResponse();
        expectedResponse.setMovieId("m1");
        expectedResponse.setTitle("Inception");

        when(movieRepository.existsByTitleAndReleaseDate("Inception", request.getReleaseDate())).thenReturn(false);
        when(movieMapper.toEntity(request)).thenReturn(entity);
        when(movieRepository.save(entity)).thenReturn(saved);
        when(movieMapper.toResponse(saved)).thenReturn(expectedResponse);

        MovieResponse result = movieService.create(request);

        assertThat(result).isSameAs(expectedResponse);
        verify(movieRepository).save(entity);
    }

    @Test
    void create_duplicateMovie_throwsMovieAlreadyExistsExceptionAndNeverSaves() {
        CreateMovieRequest request = request();
        when(movieRepository.existsByTitleAndReleaseDate("Inception", request.getReleaseDate())).thenReturn(true);

        assertThatThrownBy(() -> movieService.create(request))
                .isInstanceOf(MovieAlreadyExistsException.class)
                .hasMessageContaining("Inception");

        verify(movieRepository, never()).save(any());
        verifyNoInteractions(movieMapper);
    }

    @Test
    void createBatch_delegatesToMovieBatchService() {
        BulkCreateMovieRequest bulkRequest = new BulkCreateMovieRequest();
        bulkRequest.setMovies(List.of(request()));
        MovieBatchResponse expected = new MovieBatchResponse(List.of());
        when(movieBatchService.createBatch(bulkRequest)).thenReturn(expected);

        MovieBatchResponse result = movieService.createBatch(bulkRequest);

        assertThat(result).isSameAs(expected);
        verify(movieBatchService).createBatch(bulkRequest);
        verifyNoInteractions(movieRepository, movieMapper, mongoTemplate);
    }
}
