package com.showtime.seat;

import com.showtime.common.exception.ConflictException;

public class DuplicateSeatException extends ConflictException {
    public DuplicateSeatException(Long screenId, String row, Integer number) {
        super("A seat at position " + row + number + " already exists in this screen");
    }
}
