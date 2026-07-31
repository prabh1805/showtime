package com.showtime.user;

import com.mongodb.internal.bulk.UpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterResponse registerResponse = userService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = userService.login(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshAccessToken(@Valid @RequestBody RefreshRequest refreshRequest) {
        LoginResponse loginResponse = userService.refreshAccessToken(refreshRequest);
        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<RegisterResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PatchMapping("/me")
    public ResponseEntity<RegisterResponse> update(@Valid @RequestBody UpdateProfileRequest request) {
        RegisterResponse res = userService.updateUserDetails(request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest refreshRequest) {
        userService.logout(refreshRequest);
        return  ResponseEntity.noContent().build();
    }
}
