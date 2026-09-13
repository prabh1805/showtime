package com.showtime.show;

import com.showtime.showSeat.ShowSeatResponse;
import com.showtime.showSeat.ShowSeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;
    private final ShowSeatService showSeatService;

    @PostMapping
    public ResponseEntity<ShowResponse> createShow(@Valid @RequestBody CreateShowRequest request) {
        ShowResponse response = showService.createShow(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(params = "screenId")
    public ResponseEntity<List<ShowResponse>> listShowsByScreen(@RequestParam Long screenId) {
        return ResponseEntity.ok(showService.listShowsByScreen(screenId));
    }

    @GetMapping(params = "theaterId")
    public ResponseEntity<List<ShowResponse>> listShowsByTheater(@RequestParam Long theaterId) {
        return ResponseEntity.ok(showService.listShowsByTheater(theaterId));
    }

    @GetMapping("/{showId}/seats")
    public ResponseEntity<List<ShowSeatResponse>> getShowSeats(@PathVariable Long showId) {
        List<ShowSeatResponse> response = showSeatService.listShowSeats(showId);
        return ResponseEntity.ok(response);
    }
}