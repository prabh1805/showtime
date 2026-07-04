package com.showtime.movie;

public record MovieBatchSuccess(
        int index,
        String movieId,
        String title
) implements MovieBatchItemResult {
}
