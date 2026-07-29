package com.showtime.screen;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/theaters/{theaterId}/screens")
@RequiredArgsConstructor
public class TheaterScreensController {
    private final ScreenService screenService;

    @GetMapping
    public ResponseEntity<Page<ScreenResponse>> listByTheater(
            @PathVariable Long theaterId,
            Pageable pageable) {
        return ResponseEntity.ok(screenService.listByTheater(theaterId, pageable));
    }
}
