package com.showtime.theater;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class TheaterService {
    private final TheaterRepository theaterRepository;

    private TheaterResponse mapToTheaterResponse(Theater theater) {
        TheaterResponse theaterResponse = new TheaterResponse();
        theaterResponse.setId(theater.getId());
        theaterResponse.setName(theater.getName());
        theaterResponse.setCity(theater.getCity());
        theaterResponse.setAddress(theater.getAddress());
        theaterResponse.setStatus(theater.getStatus());
        theaterResponse.setCreatedAt(theater.getCreatedAt());
        theaterResponse.setUpdatedAt(theater.getUpdatedAt());
        return theaterResponse;
    }
    @Transactional
    public TheaterResponse create(CreateTheaterRequest request) {
        Theater theater = new Theater();
        theater.setName(request.getName());
        theater.setAddress(request.getAddress());
        theater.setCity(request.getCity());
        theater.setStatus(request.getStatus());
        Theater saved = theaterRepository.save(theater);

        return mapToTheaterResponse(saved);
    }

    public Page<TheaterResponse> listAll(String city, Pageable pageable) {

        if(city == null || city.isBlank()) {
           return theaterRepository.findAll(pageable).map(this::mapToTheaterResponse);
        }
        return theaterRepository.findByCity(city, pageable).map(this::mapToTheaterResponse);
    }

    public TheaterResponse getById(Long id) {
        return theaterRepository.findById(id)
                .map(this::mapToTheaterResponse)
                .orElseThrow(() -> new TheaterNotFoundException(id));
    }

    @Transactional
    public void softDelete(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new TheaterNotFoundException(id));
        theater.setStatus(TheaterStatus.PERMANENTLY_CLOSED);
        theaterRepository.save(theater);
    }
}
