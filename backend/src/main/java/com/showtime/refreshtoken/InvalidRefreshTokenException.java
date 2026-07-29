package com.showtime.refreshtoken;

import com.showtime.common.exception.UnauthorizedException;

public class InvalidRefreshTokenException extends UnauthorizedException {
    public InvalidRefreshTokenException() {
        super("Invalid refresh token");
    }
}
