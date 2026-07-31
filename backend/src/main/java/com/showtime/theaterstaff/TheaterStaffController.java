package com.showtime.theaterstaff;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/theaters/{theaterId}/staff")
@RequiredArgsConstructor
public class TheaterStaffController {
    private final TheaterStaffService theaterStaffService;

    @PostMapping
    public ResponseEntity<AddStaffResponse> createTheaterStaff(
            @PathVariable Long theaterId,
            @Valid @RequestBody AddStaffRequest addStaffRequest
    ){
        AddStaffResponse response = theaterStaffService.addStaff(theaterId, addStaffRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
