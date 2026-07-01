package com.showtime.screen;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
public class ScreenResponse {
    private Long id;
    private Long theaterId;
    private String theaterCity;
    private String theaterName;
    private String name;
    private ScreenStatus status;
    private ScreenType type;
    private Instant createdAt;
    private Instant updatedAt;
}
