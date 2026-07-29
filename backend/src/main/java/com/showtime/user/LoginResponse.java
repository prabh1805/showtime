package com.showtime.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
}
