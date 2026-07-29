package com.showtime.user;

import com.showtime.common.exception.NotFoundException;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
    }
}
