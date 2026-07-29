package com.showtime.movie;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {
    private final MovieService movieService;
    @PostMapping("/batch")
    public ResponseEntity<MovieBatchResponse> createBatch(@RequestBody @Valid BulkCreateMovieRequest request) {
        MovieBatchResponse res = movieService.createBatch(request);
        return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(res);
    }
}
