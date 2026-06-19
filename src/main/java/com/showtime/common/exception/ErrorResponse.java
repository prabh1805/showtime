package com.showtime.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;


@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        Integer status,
        String message,
        List<FieldError> fieldErrors,
        Instant timestamp
) {}