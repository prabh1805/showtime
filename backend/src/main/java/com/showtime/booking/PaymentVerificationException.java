package com.showtime.booking;

import com.showtime.common.exception.UnprocessableEntityException;

public class PaymentVerificationException extends UnprocessableEntityException {
    public PaymentVerificationException(String message) {
        super(message);
    }
}
