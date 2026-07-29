package com.showtime.seat;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<SeatResponse> createSeat(
            @RequestBody @Valid CreateSeatRequest createSeatRequest
    ){
        SeatResponse response = seatService.create(createSeatRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatResponse> getSeat(@PathVariable Long id){
        return ResponseEntity.ok(seatService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long id){
        seatService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

}
