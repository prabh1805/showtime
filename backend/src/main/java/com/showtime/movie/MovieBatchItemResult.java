package com.showtime.movie;

public sealed interface MovieBatchItemResult permits MovieBatchItemResult.Success, MovieBatchItemResult.Failure {
    record Success(Long tmdbId, String movieId, String title) implements MovieBatchItemResult {}
    record Failure(Long tmdbId, String reason) implements MovieBatchItemResult {}
}
