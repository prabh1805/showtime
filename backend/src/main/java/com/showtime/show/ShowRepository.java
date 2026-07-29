package com.showtime.show;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    @Query(
            "SELECT s FROM Show s WHERE s.screen.id = :screenId " +
            "AND s.startTime < :proposedEndTime " + " AND s.endTime > :proposedStartTime"

    )
    List<Show> findOverlappingShows(
            @Param("screenId") Long screenId,
            @Param("proposedStartTime") LocalDateTime proposedStartTime,
            @Param("proposedEndTime") LocalDateTime proposedEndTime
    );
}
