package com.showtime.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        ErrorResponse er = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                null,
                Instant.now()
        );
        return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(er);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());

        List<FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> new FieldError(err.getField(), err.getDefaultMessage()))
                .toList();

        ErrorResponse er = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                fieldErrors,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(er);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(HttpMessageNotReadableException ex) {
        log.warn("Malformed request body: {}", ex.getMessage());
        ErrorResponse er = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Malformed request body",
                null,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(er);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse er = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Something went wrong",
                null,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(er);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        ErrorResponse er = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                null,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(er);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        ErrorResponse er = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Data integrity violation",
                null,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(er);
    }
}
