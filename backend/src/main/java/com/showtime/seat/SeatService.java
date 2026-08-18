package com.showtime.seat;

import com.showtime.screen.Screen;
import com.showtime.screen.ScreenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {
    @Lazy
    private final ScreenService screenService;
    private final SeatRepository seatRepository;

    @Transactional
    public SeatResponse create(CreateSeatRequest createSeatRequest) {
        Screen screen = screenService.getEntityById(createSeatRequest.getScreenId());
        if(seatRepository.existsByScreenIdAndRowAndNumber(
                createSeatRequest.getScreenId(),
                createSeatRequest.getRow(),
                createSeatRequest.getNumber()))
        {
            throw new DuplicateSeatException(
                    createSeatRequest.getScreenId(),
                    createSeatRequest.getRow(),
                    createSeatRequest.getNumber());
        }
        Seat seat = new Seat();
        seat.setType(createSeatRequest.getType());
        seat.setScreen(screen);
        seat.setRow(createSeatRequest.getRow());
        seat.setNumber(createSeatRequest.getNumber());
        if(createSeatRequest.getStatus() != null){
            seat.setStatus(createSeatRequest.getStatus());
        }
        Seat result = seatRepository.save(seat);
        return mapToResponse(result);
    }

    @Transactional(readOnly = true)
    public SeatResponse getById(Long id) {
        return  mapToResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Page<SeatResponse> listByScreen(Long screenId, Pageable pageable) {
        screenService.getEntityById(screenId);
        return seatRepository.findByScreenId(screenId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void softDelete(Long id) {
        Seat seat = getEntityById(id);
        seat.setStatus(SeatStatus.REMOVED);
        seatRepository.save(seat);
    }

    public void createSeats(List<Seat> seats){
        seatRepository.saveAll(seats);
    }
    public Seat getEntityById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new SeatNotFoundException(id));
    }

    private SeatResponse mapToResponse(Seat seat) {
        SeatResponse response = new SeatResponse();
        response.setId(seat.getId());
        response.setScreenId(seat.getScreen().getId());
        response.setScreenName(seat.getScreen().getName());
        response.setRow(seat.getRow());
        response.setNumber(seat.getNumber());
        response.setType(seat.getType());
        response.setStatus(seat.getStatus());
        response.setCreatedAt(seat.getCreatedAt());
        response.setUpdatedAt(seat.getUpdatedAt());
        return response;
    }
}
