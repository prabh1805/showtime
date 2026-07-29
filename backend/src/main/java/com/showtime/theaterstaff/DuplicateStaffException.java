package com.showtime.theaterstaff;

import com.showtime.common.exception.ConflictException;

public class DuplicateStaffException extends ConflictException {
    public DuplicateStaffException(Long userId, Long theaterId) {
        super("User " + userId + " is already staff at theater " + theaterId);
    }
}