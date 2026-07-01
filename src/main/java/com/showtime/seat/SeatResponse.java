package com.showtime.seat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
public class SeatResponse {
    private Long id;
    private Long screenId;
    private String screenName;
    private String row;
    private Integer number;
    private SeatType type;
    private SeatStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
