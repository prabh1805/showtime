package com.showtime.booking;

import com.showtime.common.exception.UnauthorizedException;

public class WebhookVerificationException extends UnauthorizedException {
    public WebhookVerificationException(String message) {
        super(message);
    }
}
