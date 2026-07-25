package com.showtime.show;

import com.showtime.common.exception.NotFoundException;

public class ShowNotFoundException extends NotFoundException {
    public ShowNotFoundException(Long id) {
        super("Show with id " + id + " not found");
    }
}
