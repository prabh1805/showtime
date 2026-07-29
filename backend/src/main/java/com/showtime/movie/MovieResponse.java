package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MovieResponse {
    private String movieId;
    private String title;
    private LocalDate releaseDate;
    private int duration;
    private List<String> genre;
    private List<Cast> cast;
    private List<String> availableLanguages;
    private List<MovieFormat> availableFormats;

}
