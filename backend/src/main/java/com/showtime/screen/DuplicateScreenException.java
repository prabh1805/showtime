package com.showtime.screen;

import com.showtime.common.exception.ConflictException;

public class DuplicateScreenException extends ConflictException {
    public DuplicateScreenException(Long theaterId, String name) {
        super("A screen named " + name + " already exists in this theater");
    }
}
