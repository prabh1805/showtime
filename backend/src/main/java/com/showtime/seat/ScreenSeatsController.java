package com.showtime.seat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/screens/{screenId}/seats")
@RequiredArgsConstructor
public class ScreenSeatsController {
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<Page<SeatResponse>> listByScreen(
            @PathVariable Long screenId,
            Pageable pageable
    ){
        return ResponseEntity.ok(seatService.listByScreen(screenId, pageable));
    }
}
