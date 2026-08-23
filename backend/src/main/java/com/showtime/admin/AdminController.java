package com.showtime.admin;

import com.showtime.theater.TheaterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/owner")
    public ResponseEntity<CreateOwnerResponse> createOwner(@Valid @RequestBody CreateOwnerRequest request){
        CreateOwnerResponse response = adminService.createOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/theaters")
    public ResponseEntity<Page<TheaterResponse>> filterTheaters(
            @RequestParam(required = false) String ownerName,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String theaterName,
            Pageable pageable
    ) {
        Page<TheaterResponse> response = adminService.filterTheaters(ownerName, city, theaterName, pageable);
        return ResponseEntity.ok(response);
    }

}
