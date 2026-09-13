package com.showtime.showSeat;

import com.showtime.seat.SeatType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ShowSeatResponse {

    private Long showSeatId;
    private String row;
    private int number;
    private SeatType category;
    private BigDecimal price;
    private ShowSeatStatus status;
}