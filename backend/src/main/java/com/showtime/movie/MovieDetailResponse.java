package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MovieDetailResponse {
    private String movieId;
    private String tmdbId;
    private String title;
    private MovieStatus status;
    private LocalDate releaseDate;
    private int duration;
    private List<String> genre;
    private List<Cast> cast;
    private String posterPath;
    private String backdropPath;
}