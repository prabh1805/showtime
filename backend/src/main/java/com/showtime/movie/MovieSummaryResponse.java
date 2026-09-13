package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MovieSummaryResponse {
    private String movieId;
    private String title;
    private LocalDate releaseDate;
    private MovieStatus status;
    private int duration;
    private List<String> genre;
    private String posterPath;
}
