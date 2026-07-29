package com.showtime.screen;

import com.showtime.common.exception.NotFoundException;

public class ScreenNotFoundException extends NotFoundException {
    public ScreenNotFoundException(Long screenId) {
        super("Screen not found with id: " + screenId);
    }
}
