package com.showtime.screen;

import com.showtime.common.exception.ConflictException;

public class SeatOverlapException extends ConflictException {
    public SeatOverlapException(RowSegmentRequest curr, RowSegmentRequest last) {
        super(
                "Row " + curr.getRow() + ": seats " +
                        curr.getStartNumber() + "-" + (curr.getStartNumber() + curr.getCount() - 1) +
                        " overlap with seats " +
                        last.getStartNumber() + "-" + (last.getStartNumber() + last.getCount() - 1)
        );
    }
}
