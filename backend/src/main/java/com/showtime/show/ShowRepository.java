package com.showtime.show;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findAllByScreenIdOrderByShowTimeAsc(Long screenId);

    List<Show> findAllByScreen_Theater_IdOrderByShowTimeAsc(Long theaterId);

    List<Show> findAllByScreen_Theater_IdAndShowTimeBetween(
            Long theaterId, LocalDateTime showTimeFrom, LocalDateTime showTimeTo);

    @Query("""
    SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
    FROM Show s
    WHERE s.screen.id = :screenId
    AND s.status = :status
    AND s.showTime < :endTime
    AND :showTime < s.endTime
    """)
    boolean existsOverlappingShow(
            @Param("screenId") Long screenId,
            @Param("showTime") LocalDateTime showTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("status") ShowStatus status
    );
}
