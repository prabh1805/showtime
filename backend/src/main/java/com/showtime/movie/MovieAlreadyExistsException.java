package com.showtime.movie;

import com.showtime.common.exception.ConflictException;

import java.time.LocalDate;

public class MovieAlreadyExistsException extends ConflictException {
    public MovieAlreadyExistsException(String title, LocalDate releaseDate) {
        super("Movie with title: " + title + " released on: " + releaseDate + " already exists");
    }
}
