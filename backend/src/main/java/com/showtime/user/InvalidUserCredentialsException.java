package com.showtime.user;

import com.showtime.common.exception.UnauthorizedException;

public class InvalidUserCredentialsException extends UnauthorizedException {
    public InvalidUserCredentialsException(String email) {
        super("Invalid user credentials: " + email);
    }
}
