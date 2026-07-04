package com.showtime.movie;

public record MovieBatchFailure(int index, String errorMessage) implements MovieBatchItemResult{
}
