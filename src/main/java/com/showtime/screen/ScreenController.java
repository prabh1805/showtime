package com.showtime.screen;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/screens")
@RequiredArgsConstructor
public class ScreenController {
    private final ScreenService screenService;

    @PostMapping
    public ResponseEntity<ScreenResponse> createScreen(
            @RequestBody @Valid
            CreateScreenRequest createScreenRequest
    ) {
        ScreenResponse response = screenService.create(createScreenRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenResponse> getScreen(@PathVariable Long id) {
        return ResponseEntity.ok(screenService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScreen(@PathVariable Long id) {
        screenService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

}
