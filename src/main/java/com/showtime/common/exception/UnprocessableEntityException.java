package com.showtime.common.exception;

public abstract class UnprocessableEntityException extends RuntimeException{
    protected UnprocessableEntityException(String message) {
        super(message);
    }
}
