package com.showtime.booking;

import com.showtime.common.exception.ForbiddenException;

public class UnauthorizedBookingAccessException extends ForbiddenException {
    public UnauthorizedBookingAccessException(Long bookingId) {
        super("You are not authorized to access booking: " + bookingId);
    }
}
