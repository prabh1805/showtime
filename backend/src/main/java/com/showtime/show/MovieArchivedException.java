package com.showtime.show;

import com.showtime.common.exception.UnprocessableEntityException;
import com.showtime.movie.Movie;

public class MovieArchivedException extends UnprocessableEntityException {
    public MovieArchivedException(Movie movie) {
        super("Movie " + movie.getTitle() + " is archived "+ "and cannot be used to create a show.");
    }
}
