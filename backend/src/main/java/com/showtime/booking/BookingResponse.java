package com.showtime.booking;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class BookingResponse {

    private Long id;
    private Long showId;
    private BigDecimal amount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private BookingStatus status;
    private Instant expiresAt;
}
