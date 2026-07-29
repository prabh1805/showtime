package com.showtime.theaterstaff;

import com.showtime.common.exception.ForbiddenException;

public class UnauthorizedTheaterAccessException extends ForbiddenException {
    public UnauthorizedTheaterAccessException(String theaterName) {
        super("You are not authorized to manage staff for theater: " + theaterName);
    }
}
