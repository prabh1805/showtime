package com.showtime.showSeat;

import com.showtime.common.exception.ConflictException;

public class SeatUnavailableException extends ConflictException {
    public SeatUnavailableException(String message) {
        super(message);
    }
}
