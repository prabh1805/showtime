package com.showtime.theater;
import com.showtime.common.exception.NotFoundException;

public class TheaterNotFoundException extends NotFoundException {
    public TheaterNotFoundException(Long id) {
        super("Theater not found with id: " + id);
    }
}
