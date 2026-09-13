package com.showtime.booking;

import com.showtime.common.exception.NotFoundException;

public class BookingNotFoundException extends NotFoundException {
    public BookingNotFoundException(Long bookingId) {
        super("Booking not found with id: " + bookingId);
    }
}
