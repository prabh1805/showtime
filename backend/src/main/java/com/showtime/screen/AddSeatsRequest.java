package com.showtime.screen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class AddSeatsRequest {

    @NotEmpty(message = "row segment request cannot be empty")
    @Valid
    private List<RowSegmentRequest> rowSegmentRequests;
}
