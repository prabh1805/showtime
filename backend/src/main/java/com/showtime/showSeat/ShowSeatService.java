package com.showtime.showSeat;

import com.showtime.seat.Seat;
import com.showtime.seat.SeatService;
import com.showtime.seat.SeatStatus;
import com.showtime.seat.SeatType;
import com.showtime.show.Show;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowSeatService {
    private final SeatService seatService;
    private final ShowSeatRepository showSeatRepository;
    private final ShowSeatCacheService showSeatCacheService;

    @Transactional
    public List<ShowSeat> createShowSeats(Show show, Long screenId) {
        List<Seat> availableSeats = seatService.getSeatsByScreenIdAndStatus(screenId, SeatStatus.AVAILABLE);
        Set<SeatType> seatTypesSet = availableSeats.stream()
                .map(Seat::getType)
                .collect(Collectors.toSet());
        Map<SeatType, BigDecimal> seatPricesMap = show.getCategoryPricing();
        Set<SeatType> missingTypes = new HashSet<>(seatTypesSet);
        missingTypes.removeAll(seatPricesMap.keySet());

        if (!missingTypes.isEmpty()) {
            throw new InvalidPricingException("Missing price for seat types: " + missingTypes);
        }

        List<ShowSeat> showSeats = new ArrayList<>();
        for (Seat seat : availableSeats) {
            ShowSeat showSeat = new ShowSeat();
            showSeat.setCategory(seat.getType());
            showSeat.setShow(show);
            showSeat.setPrice(seatPricesMap.get(seat.getType()));
            showSeat.setSeat(seat);
            showSeat.setStatus(ShowSeatStatus.AVAILABLE);
            showSeats.add(showSeat);
        }
        showSeatRepository.saveAll(showSeats);
        showSeatCacheService.evict(show.getId());
        return showSeats;
    }

    @Transactional(readOnly = true)
    public List<ShowSeatResponse> listShowSeats(Long showId) {
        List<ShowSeatResponse> cached = showSeatCacheService.get(showId);
        if (cached != null) {
            return cached;
        }

        List<ShowSeatResponse> showSeatResponses = new ArrayList<>();
        List<ShowSeat> showSeats =  showSeatRepository.getShowSeatsByShowId(showId);
        for (ShowSeat showSeat : showSeats) {
            ShowSeatResponse showSeatResponse = new ShowSeatResponse();
            showSeatResponse.setNumber(showSeat.getSeat().getNumber());
            showSeatResponse.setPrice(showSeat.getPrice());
            showSeatResponse.setStatus(showSeat.getStatus());
            showSeatResponse.setCategory(showSeat.getCategory());
            showSeatResponse.setShowSeatId(showSeat.getId());
            showSeatResponse.setRow(showSeat.getSeat().getRow());
            showSeatResponses.add(showSeatResponse);
        }

        showSeatCacheService.put(showId, showSeatResponses);
        return showSeatResponses;
    }

    @Transactional
    public List<ShowSeat> lockAvailableSeats(Long showId, List<Long> showSeatIds, Long userId) {
        List<ShowSeat> showSeats = showSeatRepository.findAllByIdInAndShowIdForUpdate(showSeatIds, showId);

        if (showSeats.size() != showSeatIds.size()) {
            throw new SeatUnavailableException("One or more selected seats do not belong to this show");
        }

        boolean allAvailable = showSeats.stream()
                .allMatch(showSeat -> showSeat.getStatus() == ShowSeatStatus.AVAILABLE);
        if (!allAvailable) {
            throw new SeatUnavailableException("One or more selected seats are no longer available");
        }

        Instant now = Instant.now();
        for (ShowSeat showSeat : showSeats) {
            showSeat.setStatus(ShowSeatStatus.LOCKED);
            showSeat.setLockedBy(userId);
            showSeat.setLockedAt(now);
        }
        List<ShowSeat> result = showSeatRepository.saveAll(showSeats);
        showSeatCacheService.evict(showId);
        return result;
    }

    @Transactional
    public void assignBooking(List<ShowSeat> showSeats, Long bookingId) {
        for (ShowSeat showSeat : showSeats) {
            showSeat.setBookingId(bookingId);
        }
        showSeatRepository.saveAll(showSeats);
    }

    @Transactional
    public void markBooked(Long bookingId) {
        List<ShowSeat> showSeats = showSeatRepository.findAllByBookingId(bookingId);
        for (ShowSeat showSeat : showSeats) {
            showSeat.setStatus(ShowSeatStatus.BOOKED);
        }
        showSeatRepository.saveAll(showSeats);
        evictCacheFor(showSeats);
    }

    @Transactional
    public void releaseSeats(Long bookingId) {
        List<ShowSeat> showSeats = showSeatRepository.findAllByBookingId(bookingId);
        for (ShowSeat showSeat : showSeats) {
            showSeat.setStatus(ShowSeatStatus.AVAILABLE);
            showSeat.setLockedBy(null);
            showSeat.setLockedAt(null);
            showSeat.setBookingId(null);
        }
        showSeatRepository.saveAll(showSeats);
        evictCacheFor(showSeats);
    }

    private void evictCacheFor(List<ShowSeat> showSeats) {
        showSeats.stream()
                .map(showSeat -> showSeat.getShow().getId())
                .distinct()
                .forEach(showSeatCacheService::evict);
    }
}
