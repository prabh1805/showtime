package com.showtime.theater;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/theaters")
@RequiredArgsConstructor
public class TheaterController {
    private final TheaterService theaterService;

    @PostMapping
    public ResponseEntity<TheaterResponse> createTheater(@RequestBody @Valid CreateTheaterRequest request) {
        //if (true) throw new RuntimeException("Test fallback handler");
        TheaterResponse response = theaterService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TheaterResponse>> listTheaters(
            @RequestParam(required = false) String city,
            Pageable pageable
    ) {
        return ResponseEntity.ok(theaterService.listAll(city, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheaterResponse> getTheater(@PathVariable Long id) {
        return ResponseEntity.ok(theaterService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTheater(@PathVariable Long id) {
        theaterService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
