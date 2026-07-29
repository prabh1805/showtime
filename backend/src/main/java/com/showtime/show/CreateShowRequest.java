package com.showtime.show;


import com.showtime.movie.MovieFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CreateShowRequest {

    @NotBlank(message = "Movie ID cannot be blank")
    private String movieId;

    @NotNull(message = "Screen ID cannot be null")
    private Long screenId;

    @NotNull(message = "Start time cannot be null")
    private LocalDateTime startTime;

    @NotBlank(message = "Language cannot be blank")
    private String language;

    @NotNull(message = "Format cannot be null")
    private MovieFormat format;

    @NotNull(message = "Interval minutes cannot be null")
    @PositiveOrZero(message = "Interval minutes must be zero or positive")
    private Integer intervalMinutes;
}
