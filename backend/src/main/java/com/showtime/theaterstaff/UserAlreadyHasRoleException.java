package com.showtime.theaterstaff;

import com.showtime.common.exception.ConflictException;

public class UserAlreadyHasRoleException extends ConflictException {
    public UserAlreadyHasRoleException(Long userId) {
        super("User " + userId + " already has an assigned role and cannot be added as staff");
    }
}