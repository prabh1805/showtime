package com.showtime.movie;

import com.showtime.common.exception.BadGatewayException;
import lombok.Getter;

@Getter
public class TmdbSyncException extends BadGatewayException {

    private final int statusCode;

    public TmdbSyncException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}