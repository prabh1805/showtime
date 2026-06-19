package com.showtime.theater;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateTheaterRequest {
    @NotBlank
    @Size(max = 50)
    private String city;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(min = 1, max = 255)
    private String address;

    private TheaterStatus status;
}
