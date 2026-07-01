package com.showtime.screen;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateScreenRequest {

    @NotNull(message = "theater id is required")
    private Long theaterId;

    @NotBlank(message = "screen name is required")
    @Size(max = 50, message = "screen name must be at most 50 characters")
    private String name;

    @NotNull(message = "screen type is required")
    private ScreenType type;

    private ScreenStatus status;
}
