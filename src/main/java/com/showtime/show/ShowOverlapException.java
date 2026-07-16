package com.showtime.show;

import com.showtime.common.exception.ConflictException;
import com.showtime.screen.Screen;

import java.time.LocalDateTime;
import java.util.List;

public class ShowOverlapException extends ConflictException {
    public ShowOverlapException(LocalDateTime startTime, LocalDateTime endTime, Screen screen) {
        super(
                "There is already a scheduled show at "
                        + screen.getName()
                        + " that overlaps with the requested time range: "
                        + startTime + " to " + endTime
        );
    }
}
