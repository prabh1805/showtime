package com.showtime.seat;

import com.showtime.screen.Screen;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
        name = "seat",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_seat_screen_row_number",
                        columnNames = {"screen_id", "seat_row", "number"}
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "screen_id",
            nullable = false,
            updatable = false
    )
    private Screen screen;

    @Column(name = "seat_row", nullable = false, length = 10)
    private String row;

    @Column(nullable = false)
    private int number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType type;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

}
