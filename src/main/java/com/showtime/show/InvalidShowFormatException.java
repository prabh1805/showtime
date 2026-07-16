package com.showtime.show;

import com.showtime.common.exception.UnprocessableEntityException;
import com.showtime.movie.Movie;
import com.showtime.movie.MovieFormat;

public class InvalidShowFormatException extends UnprocessableEntityException {
    public InvalidShowFormatException(Movie movie, MovieFormat format) {
        super("Movie '" + movie.getTitle() + "' does not support the format '" + format + "'.");
    }
}
