package com.showtime.show;

import com.showtime.movie.MovieFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ShowResponse {
    private Long id;
    private String movieId;
    private String movieTitle;
    private Long screenId;
    private String screenName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String language;
    private MovieFormat format;
    private ShowStatus status;
    private Instant createdAt;
    private boolean seatsReady;
}
