package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TmdbMovieResponse {
    private Long id;
    private String title;
    private String originalTitle;
    private String overview;
    private Double runtime;
    private LocalDate releaseDate;
    private String status;
    private List<TmdbGenre> genres;
    private String posterPath;
    private String backdropPath;
    private Boolean adult;
}
