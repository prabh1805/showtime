package com.showtime.movie;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BulkCreateMovieRequest {
    @NotEmpty
    @Valid
    private List<CreateMovieRequest> movies;
}
