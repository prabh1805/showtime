package com.showtime.screen;

import com.showtime.seat.DuplicateSeatException;
import com.showtime.seat.Seat;
import com.showtime.seat.SeatService;
import com.showtime.seat.SeatStatus;
import com.showtime.theater.Theater;
import com.showtime.theater.TheaterService;
import com.showtime.theaterstaff.TheaterStaffService;
import com.showtime.theaterstaff.UnauthorizedTheaterAccessException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenService {
    private final ScreenRepository screenRepository;
    private final TheaterService theaterService;
    private final TheaterStaffService theaterStaffService;

    @Lazy
    private final SeatService seatService;

    @Transactional
    public ScreenResponse create(CreateScreenRequest request) {
        Theater theater = theaterService.getEntityById(request.getTheaterId());
        theaterStaffService.assertCallerCanManage(theater, "create screens for");

        if(screenRepository.existsByTheaterIdAndName(request.getTheaterId(), request.getName())) {
            throw new DuplicateScreenException(request.getTheaterId(), request.getName());
        }
        Screen screen = new Screen();
        screen.setTheater(theater);
        screen.setName(request.getName());
        screen.setType(request.getType());
        screen.setBufferMinutes(request.getBufferMinutes());
        if(request.getStatus() != null) {
            screen.setStatus(request.getStatus());
        }

        ensureNoOverlap(request.getRowSegmentRequests());
        Screen result = screenRepository.save(screen);
        seatService.createSeats(convertToValidSeats(request.getRowSegmentRequests(),  result));
        return mapToScreenResponse(result);
    }

    @Transactional(readOnly = true)
    public ScreenResponse getById(Long id) {
        return mapToScreenResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Page<ScreenResponse> listByTheater(Long theaterId, Pageable pageable) {
        theaterService.getEntityById(theaterId);
        return screenRepository.findByTheaterId(theaterId, pageable).map(this::mapToScreenResponse);
    }

    @Transactional
    public void softDelete(Long id) {
        Screen screen = getEntityById(id);
        theaterStaffService.assertCallerCanManage(screen.getTheater(), "delete screens at");
        screen.setStatus(ScreenStatus.PERMANENTLY_CLOSED);
        screenRepository.save(screen);
    }

    @Transactional
    public ScreenResponse update(Long id, UpdateScreenRequest request) {
        Screen screen = getEntityById(id);
        theaterStaffService.assertCallerCanManage(screen.getTheater(), "update screens at");

        if (request.getName() != null
                && !request.getName().equals(screen.getName())
                && screenRepository.existsByTheaterIdAndName(screen.getTheater().getId(), request.getName())) {
            throw new DuplicateScreenException(screen.getTheater().getId(), request.getName());
        }

        if (request.getName() != null) {
            screen.setName(request.getName());
        }
        if (request.getType() != null) {
            screen.setType(request.getType());
        }
        if (request.getStatus() != null) {
            screen.setStatus(request.getStatus());
        }
        if (request.getBufferMinutes() != null) {
            screen.setBufferMinutes(request.getBufferMinutes());
        }

        Screen result = screenRepository.save(screen);
        return mapToScreenResponse(result);
    }

    @Transactional
    public ScreenResponse addSeats(Long screenId, List<RowSegmentRequest> rowSegmentRequests) {
        Screen screen = getEntityById(screenId);
        theaterStaffService.assertCallerCanManage(screen.getTheater(), "add seats for");

        ensureNoOverlap(rowSegmentRequests);
        ensureNoConflictWithExisting(screenId, rowSegmentRequests);

        seatService.createSeats(convertToValidSeats(rowSegmentRequests, screen));
        return mapToScreenResponse(screen);
    }

    public Screen getEntityById(Long id) {
        return screenRepository.findById(id)
                .orElseThrow(() -> new ScreenNotFoundException(id));
    }

    private ScreenResponse mapToScreenResponse(Screen screen) {
        ScreenResponse screenResponse = new ScreenResponse();
        screenResponse.setId(screen.getId());
        screenResponse.setName(screen.getName());
        screenResponse.setType(screen.getType());
        screenResponse.setStatus(screen.getStatus());
        screenResponse.setTheaterId(screen.getTheater().getId());
        screenResponse.setTheaterName(screen.getTheater().getName());
        screenResponse.setTheaterCity(screen.getTheater().getCity());
        screenResponse.setCreatedAt(screen.getCreatedAt());
        screenResponse.setUpdatedAt(screen.getUpdatedAt());
        screenResponse.setBufferMinutes(screen.getBufferMinutes());
        return screenResponse;
    }

    private void  ensureNoOverlap(List<RowSegmentRequest> rowSegmentRequests) {

        Map<String, List<RowSegmentRequest>> byRow = rowSegmentRequests.stream()
                .collect(Collectors.groupingBy(RowSegmentRequest::getRow));

        for(String key : byRow.keySet()) {
            List<RowSegmentRequest> list = byRow.get(key);
            list.sort((a, b) ->
                    a.getStartNumber().compareTo(b.getStartNumber()));
            for(int indx = 1; indx < list.size(); indx++) {
                RowSegmentRequest curr =  list.get(indx);
                RowSegmentRequest last =  list.get(indx - 1);
                if(curr.getStartNumber() <= last.getStartNumber() + last.getCount() - 1){
                    throw new SeatOverlapException(last, curr);
                }
            }
        }
    }

    private void ensureNoConflictWithExisting(Long screenId, List<RowSegmentRequest> rowSegmentRequests) {
        Set<String> existingKeys = seatService.getAllByScreenId(screenId).stream()
                .map(seat -> seat.getRow() + "-" + seat.getNumber())
                .collect(Collectors.toSet());

        for (RowSegmentRequest segment : rowSegmentRequests) {
            for (int i = 0; i < segment.getCount(); i++) {
                int number = segment.getStartNumber() + i;
                if (existingKeys.contains(segment.getRow() + "-" + number)) {
                    throw new DuplicateSeatException(screenId, segment.getRow(), number);
                }
            }
        }
    }

    private List<Seat> convertToValidSeats(List<RowSegmentRequest> requests, Screen screen) {
        List<Seat> seats = new ArrayList<>();
        for(RowSegmentRequest request : requests) {
            for(int i = 0; i < request.getCount(); i++) {
                Seat seat = new Seat();
                seat.setRow(request.getRow());
                seat.setNumber(request.getStartNumber() + i);
                seat.setType(request.getSeatType());
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setScreen(screen);
                seats.add(seat);
            }
        }
        return seats;
    }
}
