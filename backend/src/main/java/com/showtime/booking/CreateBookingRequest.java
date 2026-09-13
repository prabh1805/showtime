package com.showtime.booking;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull(message = "showId is required")
    private Long showId;

    @NotEmpty(message = "showSeatIds must not be empty")
    private List<Long> showSeatIds;
}