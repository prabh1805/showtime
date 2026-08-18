package com.showtime.screen;

import com.showtime.seat.SeatType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class RowSegmentRequest {

    @NotBlank(message = "row cannot be blank")
    @Pattern(regexp = "^[A-Z]{1,3}$", message = "row can be of max length 3")
    private String row;

    @NotNull(message = "type of seat can't be null")
    private SeatType seatType;

    @NotNull(message = "start number cannot be null")
    @Min(value = 1, message = "start number cannot be less then 1")
    private Integer startNumber;

    @NotNull(message = "count cannot be null")
    @Min(value = 1, message = "count cannot be less then 1")
    @Max(value = 100, message = "count cannot be more then 100")
    private Integer count;
}
