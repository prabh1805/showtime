package com.showtime.show;

import com.showtime.seat.SeatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class CreateShowRequest {

    @NotBlank(message = "movieId is required")
    private String movieId;

    @NotNull(message = "screenId is required")
    private Long screenId;

    @NotNull(message = "showTime is required")
    private LocalDateTime showTime;

    @NotBlank(message = "language is required")
    private String language;

    @NotNull(message = "format is required")
    private ShowFormat format;

    @NotEmpty(message = "categoryPricing must not be empty")
    private Map<SeatType, BigDecimal> categoryPricing;
}