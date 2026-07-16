package com.showtime.show;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shows")
@RequiredArgsConstructor
public class ShowController {
    private final ShowService showService;

    @PostMapping
    public ResponseEntity<ShowResponse> createShow(
            @RequestBody @Valid CreateShowRequest createShowRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(showService.create(createShowRequest));
    }
}
