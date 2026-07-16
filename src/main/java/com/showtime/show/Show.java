package com.showtime.show;

import com.showtime.movie.MovieFormat;
import com.showtime.screen.Screen;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "show")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Show {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String movieId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "screen_id",
            nullable = false,
            updatable = false
    )
    private Screen screen;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MovieFormat format;

    @Column(nullable = false)
    private String language;


    private int intervalMinutes;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ShowStatus status = ShowStatus.SCHEDULED;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
