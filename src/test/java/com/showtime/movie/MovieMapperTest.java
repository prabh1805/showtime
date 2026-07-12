package com.showtime.movie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MovieMapperTest {

    private final MovieMapper movieMapper = Mappers.getMapper(MovieMapper.class);

    private CreateMovieRequest request;

    @BeforeEach
    void setUp() {
        request = new CreateMovieRequest();
        request.setTitle("Inception");
        request.setDuration(148);
        request.setReleaseDate(LocalDate.of(2010, 7, 16));
        request.setAvailableLanguages(List.of("English", "Hindi"));
        request.setAvailableFormats(List.of(MovieFormat.TWO_D, MovieFormat.THREE_D));
        request.setGenre(List.of("Sci-Fi"));
        Cast cast = new Cast();
        cast.setActorName("Leonardo DiCaprio");
        cast.setCharacterName("Cobb");
        request.setCast(List.of(cast));
    }

    @Test
    void toEntity_mapsAllFieldsAndIgnoresMovieId() {
        Movie movie = movieMapper.toEntity(request);

        assertThat(movie.getMovieId()).isNull();
        assertThat(movie.getTitle()).isEqualTo("Inception");
        assertThat(movie.getDuration()).isEqualTo(148);
        assertThat(movie.getReleaseDate()).isEqualTo(LocalDate.of(2010, 7, 16));
        assertThat(movie.getAvailableLanguages()).containsExactly("English", "Hindi");
        assertThat(movie.getAvailableFormats()).containsExactly(MovieFormat.TWO_D, MovieFormat.THREE_D);
        assertThat(movie.getGenre()).containsExactly("Sci-Fi");
        assertThat(movie.getCast()).hasSize(1);
        assertThat(movie.getCast().getFirst().getActorName()).isEqualTo("Leonardo DiCaprio");
        assertThat(movie.getCast().getFirst().getCharacterName()).isEqualTo("Cobb");
    }

    @Test
    void toResponse_mapsAllFieldsFromEntity() {
        Movie movie = movieMapper.toEntity(request);
        movie.setMovieId("m1");

        MovieResponse response = movieMapper.toResponse(movie);

        assertThat(response.getMovieId()).isEqualTo("m1");
        assertThat(response.getTitle()).isEqualTo("Inception");
        assertThat(response.getDuration()).isEqualTo(148);
        assertThat(response.getReleaseDate()).isEqualTo(LocalDate.of(2010, 7, 16));
        assertThat(response.getAvailableLanguages()).containsExactly("English", "Hindi");
        assertThat(response.getAvailableFormats()).containsExactly(MovieFormat.TWO_D, MovieFormat.THREE_D);
        assertThat(response.getGenre()).containsExactly("Sci-Fi");
        assertThat(response.getCast()).hasSize(1);
    }

    @Test
    void toEntity_withNullRequest_returnsNull() {
        assertThat(movieMapper.toEntity(null)).isNull();
    }

    @Test
    void toResponse_withNullMovie_returnsNull() {
        assertThat(movieMapper.toResponse(null)).isNull();
    }

    @Test
    void toEntity_withNullOptionalFields_mapsWithoutThrowing() {
        request.setDuration(null);
        request.setGenre(null);
        request.setCast(null);

        Movie movie = movieMapper.toEntity(request);

        assertThat(movie.getDuration()).isZero();
        assertThat(movie.getGenre()).isNull();
        assertThat(movie.getCast()).isNull();
        assertThat(movie.getAvailableLanguages()).containsExactly("English", "Hindi");
    }

    @Test
    void toResponse_withNullOptionalFields_mapsWithoutThrowing() {
        Movie movie = new Movie();
        movie.setMovieId("m1");
        movie.setTitle("Inception");
        movie.setGenre(null);
        movie.setCast(null);
        movie.setAvailableLanguages(null);
        movie.setAvailableFormats(null);

        MovieResponse response = movieMapper.toResponse(movie);

        assertThat(response.getMovieId()).isEqualTo("m1");
        assertThat(response.getGenre()).isNull();
        assertThat(response.getCast()).isNull();
        assertThat(response.getAvailableLanguages()).isNull();
        assertThat(response.getAvailableFormats()).isNull();
    }
}
