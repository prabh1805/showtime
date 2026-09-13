package com.showtime.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);
    List<Booking> findAllByStatusAndExpiresAtBefore(BookingStatus status, Instant instant);
    List<Booking> findAllByShow_Screen_Theater_IdAndStatusAndCreatedAtAfter(
            Long theaterId, BookingStatus status, Instant createdAtAfter);
}
