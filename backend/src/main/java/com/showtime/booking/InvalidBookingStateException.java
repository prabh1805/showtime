package com.showtime.booking;

import com.showtime.common.exception.UnprocessableEntityException;

public class InvalidBookingStateException extends UnprocessableEntityException {
    public InvalidBookingStateException(Long bookingId, BookingStatus status) {
        super("Booking " + bookingId + " is not awaiting payment (current status: " + status + ")");
    }
}
