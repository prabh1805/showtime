package com.showtime.admin;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOwnerResponse {
    private Long ownerId;
    private Long theaterId;
}
