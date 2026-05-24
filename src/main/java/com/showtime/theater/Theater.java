package com.showtime.theater;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;


@Entity
@EntityListeners(AuditingEntityListener.class)
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 100)
    private String name; //name of the theatre like pvr saket

    @Column(length = 255)
    private String address; //in case someone needs actual address ti visit

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TheaterStatus status = TheaterStatus.OPERATIONAL;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
