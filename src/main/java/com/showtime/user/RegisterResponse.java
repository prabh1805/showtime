package com.showtime.user;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private Role role;
}
