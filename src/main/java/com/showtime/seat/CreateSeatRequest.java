package com.showtime.seat;


import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateSeatRequest {
    @NotNull(message = "screen id is required")
    private Long screenId;

    @NotBlank(message = "seat's row is required")
    @Size(max = 10, message = "seat's row must be at most 10 characters")
    private String row;

    @NotNull(message = "seat's number is required")
    @Min(value = 1, message = "seat's number must be at least 1")
    @Max(value = 500, message = "seat's number can be at most 500")
    private Integer number;

    @NotNull(message = "seat type is required")
    private SeatType type;

    private SeatStatus status;
}
