package com.showtime.user;

import com.showtime.common.exception.UnprocessableEntityException;

public class InvalidPasswordException extends UnprocessableEntityException {
    public InvalidPasswordException() {
        super("Current password is incorrect");
    }
}