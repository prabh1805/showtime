package com.showtime.user;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequest {
    @Size(min = 1, max = 50)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 10)
    private String mobileNumber;
}
