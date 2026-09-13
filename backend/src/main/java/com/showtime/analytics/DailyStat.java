package com.showtime.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One zero-filled day in an analytics range — every day in the window appears, even with no activity. */
public record DailyStat(LocalDate date, BigDecimal revenue, long bookingsCount, long showsCount) {}
