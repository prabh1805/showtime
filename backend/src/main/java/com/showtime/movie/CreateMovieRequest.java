package com.showtime.movie;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateMovieRequest {

    @NotBlank(message = "Movie title can't be null.")
    private String title;

    @NotNull(message = "Duration of a movie can't be null.")
    private Integer duration;

    @NotNull(message = "Release date of a movie can't be null.")
    private LocalDate releaseDate;

    @NotEmpty(message = "Available languages for a movie can't be null.")
    private List<String> availableLanguages;

    @NotEmpty(message = "Available formats for a movie can't be null")
    private List<MovieFormat> availableFormats;

    private List<String> genre;
    private List<Cast> cast;
}
