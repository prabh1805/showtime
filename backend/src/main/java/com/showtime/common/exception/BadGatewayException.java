package com.showtime.common.exception;

/**
 * Raised when an upstream dependency we call synchronously (e.g. TMDB) is
 * unreachable or answers with an error, so the failure is not ours to fix.
 * Handled as HTTP 502 by {@link GlobalExceptionHandler}.
 */
public abstract class BadGatewayException extends RuntimeException {
    protected BadGatewayException(String message) {
        super(message);
    }
}
