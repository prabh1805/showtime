package com.showtime.showSeat;

import com.showtime.common.exception.UnprocessableEntityException;

public class InvalidPricingException extends UnprocessableEntityException {
    public InvalidPricingException(String message) {
        super(message);
    }
}
