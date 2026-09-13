package com.showtime.analytics;

import com.showtime.booking.Booking;
import com.showtime.booking.BookingRepository;
import com.showtime.booking.BookingStatus;
import com.showtime.show.Show;
import com.showtime.show.ShowRepository;
import com.showtime.theater.Theater;
import com.showtime.theater.TheaterService;
import com.showtime.theaterstaff.TheaterStaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final TheaterService theaterService;
    private final TheaterStaffService theaterStaffService;

    /**
     * Revenue (SUCCESS bookings only), booking counts, and scheduled-show
     * counts for a theater over the trailing {@code days} days (inclusive
     * of today), zero-filled so every day in the window appears in the
     * series even with no activity.
     */
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(Long theaterId, int days) {
        Theater theater = theaterService.getEntityById(theaterId);
        theaterStaffService.assertCallerCanManage(theater, "view analytics for");

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1L);
        Instant bookingsFrom = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        LocalDateTime showsFrom = startDate.atStartOfDay();
        LocalDateTime showsTo = today.plusDays(1).atStartOfDay();

        List<Booking> bookings = bookingRepository.findAllByShow_Screen_Theater_IdAndStatusAndCreatedAtAfter(
                theaterId, BookingStatus.SUCCESS, bookingsFrom);
        List<Show> shows = showRepository.findAllByScreen_Theater_IdAndShowTimeBetween(
                theaterId, showsFrom, showsTo);

        Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();
        Map<LocalDate, Long> bookingsByDay = new HashMap<>();
        for (Booking booking : bookings) {
            LocalDate day = booking.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
            revenueByDay.merge(day, booking.getAmount(), BigDecimal::add);
            bookingsByDay.merge(day, 1L, Long::sum);
        }

        Map<LocalDate, Long> showsByDay = new HashMap<>();
        for (Show show : shows) {
            showsByDay.merge(show.getShowTime().toLocalDate(), 1L, Long::sum);
        }

        List<DailyStat> dailyStats = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalBookings = 0;
        long totalShows = 0;
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            BigDecimal revenue = revenueByDay.getOrDefault(date, BigDecimal.ZERO);
            long bookingsCount = bookingsByDay.getOrDefault(date, 0L);
            long showsCount = showsByDay.getOrDefault(date, 0L);
            dailyStats.add(new DailyStat(date, revenue, bookingsCount, showsCount));
            totalRevenue = totalRevenue.add(revenue);
            totalBookings += bookingsCount;
            totalShows += showsCount;
        }

        AnalyticsResponse response = new AnalyticsResponse();
        response.setTotalRevenue(totalRevenue);
        response.setTotalBookings(totalBookings);
        response.setTotalShows(totalShows);
        response.setDailyStats(dailyStats);
        return response;
    }
}
