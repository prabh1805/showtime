package com.showtime.screen;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(
        name = "screens",
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
}
