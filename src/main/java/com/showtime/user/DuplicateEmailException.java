package com.showtime.user;

import com.showtime.common.exception.ConflictException;

public class DuplicateEmailException extends ConflictException {
    public DuplicateEmailException(String email) {
        super("Email already exists: " + email);
    }
}
