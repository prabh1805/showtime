package com.showtime.analytics;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class AnalyticsResponse {
    private BigDecimal totalRevenue;
    private long totalBookings;
    private long totalShows;
    private List<DailyStat> dailyStats;
}
