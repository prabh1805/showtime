package com.showtime.theater;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateTheaterRequest {
    @NotBlank(message = "city is required")
    @Size(max = 50, message = "city must be at most 50 characters")
    private String city;

    @NotBlank(message = "theater name is required")
    @Size(max = 100, message = "theater name must be at most 100 characters")
    private String name;

    @Size(min = 1, max = 255, message = "address must be 1 to 255 characters")
    private String address;

    @NotNull(message = "status is required")
    private TheaterStatus status;
}
