package com.showtime.screen;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UpdateScreenRequest {

    @Size(max = 50, message = "screen name must be at most 50 characters")
    private String name;

    private ScreenType type;

    private ScreenStatus status;

    @PositiveOrZero(message = "buffer minutes must be a positive number")
    private Integer bufferMinutes;
}
