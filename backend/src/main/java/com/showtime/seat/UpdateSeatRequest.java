package com.showtime.seat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UpdateSeatRequest {
    private SeatStatus status;
    private SeatType type;
}
