package com.showtime.show;

import com.showtime.common.exception.UnprocessableEntityException;

public class ShowOverlapException  extends UnprocessableEntityException {
    public ShowOverlapException(String message) {
        super(message);
    }
}
