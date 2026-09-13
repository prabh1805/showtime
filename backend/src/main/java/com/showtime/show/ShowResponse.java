package com.showtime.show;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ShowResponse {

    private Long id;
    private String movieId;
    private String movieName;
    private Long screenId;
    private String screenName;
    private LocalDateTime showTime;
    private LocalDateTime endTime;
    private int totalSeatsCreated;
    private String language;
    private ShowFormat format;
    private ShowStatus status;
}