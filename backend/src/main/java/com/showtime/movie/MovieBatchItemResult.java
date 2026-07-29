package com.showtime.movie;

public sealed interface MovieBatchItemResult permits MovieBatchSuccess, MovieBatchFailure{
    int index();
}
