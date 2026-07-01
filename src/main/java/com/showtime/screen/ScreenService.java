package com.showtime.screen;

import com.showtime.theater.Theater;
import com.showtime.theater.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScreenService {
    private final ScreenRepository screenRepository;
    private final TheaterService theaterService;

    @Transactional
    public ScreenResponse create(CreateScreenRequest request) {
        Theater theater = theaterService.getEntityById(request.getTheaterId());
        if(screenRepository.existsByTheaterIdAndName(request.getTheaterId(), request.getName())) {
            throw new DuplicateScreenException(request.getTheaterId(), request.getName());
        }
        Screen screen = new Screen();
        screen.setTheater(theater);
        screen.setName(request.getName());
        screen.setType(request.getType());
        if(request.getStatus() != null) {
            screen.setStatus(request.getStatus());
        }

        Screen result = screenRepository.save(screen);
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
        screen.setStatus(ScreenStatus.PERMANENTLY_CLOSED);
        screenRepository.save(screen);
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
        return screenResponse;
    }
}
