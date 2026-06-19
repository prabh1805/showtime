package com.showtime.theater;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
public class TheaterResponse {
    private Long id;
    private String city;
    private String name;
    private String address;
    private TheaterStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
