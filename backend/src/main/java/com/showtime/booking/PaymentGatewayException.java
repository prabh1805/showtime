package com.showtime.booking;

import com.showtime.common.exception.BadGatewayException;

public class PaymentGatewayException extends BadGatewayException {
    public PaymentGatewayException(String message) {
        super(message);
    }
}
