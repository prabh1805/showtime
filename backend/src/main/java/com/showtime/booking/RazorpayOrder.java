package com.showtime.booking;

public record RazorpayOrder(
        String orderId,
        String currency,
        long amountInPaise
) {}
