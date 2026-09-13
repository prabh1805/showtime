package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MovieCatalogResponse {
    private String title;
    private int duration;
    private List<Cast> cast;
    private List<String> genre;
    private String posterPath;
    private String backdropPath;
    private LocalDate releaseDate;
}
