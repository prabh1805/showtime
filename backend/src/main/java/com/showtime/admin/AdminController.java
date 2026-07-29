package com.showtime.admin;

import com.showtime.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;

    @PostMapping("/owner")
    public ResponseEntity<CreateOwnerResponse> createOwner(@Valid @RequestBody CreateOwnerRequest request){
        CreateOwnerResponse response = userService.createOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
