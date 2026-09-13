package com.showtime.booking;

import com.showtime.common.exception.UnprocessableEntityException;

public class BookingExpiredException extends UnprocessableEntityException {
    public BookingExpiredException(Long bookingId) {
        super("Booking " + bookingId + " has expired; please create a new booking");
    }
}
