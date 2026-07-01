package com.showtime.seat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    Page<Seat> findByScreenId(Long screenId, Pageable pageable);
    boolean existsByScreenIdAndRowAndNumber(Long screenId, String row, Integer number);
}
