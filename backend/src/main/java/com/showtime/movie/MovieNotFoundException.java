package com.showtime.movie;

import com.showtime.common.exception.NotFoundException;

public class MovieNotFoundException extends NotFoundException {
    public MovieNotFoundException(String movieId) {
        super("Movie with id " + movieId + " not found");
    }
}
