package com.showtime.showSeat;

import com.showtime.screen.Screen;
import com.showtime.screen.ScreenService;
import com.showtime.seat.Seat;
import com.showtime.seat.SeatRepository;
import com.showtime.seat.SeatType;
import com.showtime.show.Show;
import com.showtime.show.ShowRepository;
import com.showtime.show.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShowSeatService {

    private final ShowSeatRepository showSeatRepository;
    private final ScreenService  screenService;
    private final ShowService showService;
    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;
    private final Map<SeatType, BigDecimal> seatPrices = Map.of(
            SeatType.REGULAR, new BigDecimal("500.00"),
            SeatType.PREMIUM, new BigDecimal("1000.00"),
            SeatType.RECLINER, new BigDecimal("1500.00")
    );

    public void createSeatsForShow(Long showId){
        Show s = showService.getEntityById(showId);
        List<Seat> seats = seatRepository.findAllByScreenId(s.getScreen().getId());

        List<ShowSeat> showSeats = seats.stream().map(seat -> {
            ShowSeat showSeat = new ShowSeat();
            showSeat.setShow(s);
            showSeat.setSeat(seat);
            showSeat.setPrice(returnSeatPrice(seat.getType()));
            return showSeat;
        }).toList();
        showSeatRepository.saveAll(showSeats);
        s.setSeatsReady(true);
        showRepository.save(s);
    }

    private BigDecimal returnSeatPrice(SeatType seatType){
        return seatPrices.getOrDefault(seatType, BigDecimal.ZERO);
    }
}
