package com.showtime.theaterstaff;

import com.showtime.common.exception.ForbiddenException;

public class UnauthorizedTheaterAccessException extends ForbiddenException {
    public UnauthorizedTheaterAccessException(String action, String theaterName) {
        super("You are not authorized to " + action + " theater: " + theaterName);
    }
}