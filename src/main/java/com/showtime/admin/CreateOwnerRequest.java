package com.showtime.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOwnerRequest {
    @NotBlank(message = "Email is required")
    @Size(max = 255, message = "Email must be at most 255 characters long")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;

    @NotBlank(message = "city is required")
    @Size(max = 50, message = "city must be at most 50 characters")
    private String city;

    @NotBlank(message = "theater name is required")
    @Size(max = 100, message = "theater name must be at most 100 characters")
    private String theaterName;

    @Size(min = 1, max = 255, message = "address must be 1 to 255 characters")
    private String address;

}
