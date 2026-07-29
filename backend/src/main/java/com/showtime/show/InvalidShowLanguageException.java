package com.showtime.show;

import com.showtime.common.exception.UnprocessableEntityException;
import com.showtime.movie.Movie;

public class InvalidShowLanguageException extends UnprocessableEntityException {
    public InvalidShowLanguageException(Movie movie, String language) {
        super("Movie '" + movie.getTitle() + "' does not support the language '" + language + "'.");
    }
}
