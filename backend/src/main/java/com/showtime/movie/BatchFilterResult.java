package com.showtime.movie;

import java.util.List;

public record BatchFilterResult(List<IndexedMovie> clean, List<MovieBatchItemResult> failures) {}
