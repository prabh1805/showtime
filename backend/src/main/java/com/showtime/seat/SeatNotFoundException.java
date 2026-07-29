package com.showtime.seat;

import com.showtime.common.exception.NotFoundException;

public class SeatNotFoundException extends NotFoundException {
    public SeatNotFoundException(Long seatId) {
        super("Seat not found with id: " + seatId);
    }
}
