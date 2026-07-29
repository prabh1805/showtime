package com.showtime.screen;

import com.showtime.theater.Theater;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
        name = "screen",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_screen_theater_name",
                        columnNames = {"theater_id", "name"}
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "theater_id",
            nullable = false,
            updatable = false
    )
    private Theater theater;

    @Column(nullable = false, length = 50)
    private String name;

    private int bufferMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreenType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreenStatus status =  ScreenStatus.OPERATIONAL;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

}
