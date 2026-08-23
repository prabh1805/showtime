package com.showtime.theater;


import com.showtime.theaterstaff.EmploymentStatus;
import com.showtime.theaterstaff.TheaterStaff;
import com.showtime.theaterstaff.TheaterStaffRepository;
import com.showtime.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TheaterService {
    private final TheaterRepository theaterRepository;
    private final TheaterStaffRepository theaterStaffRepository;

    private TheaterResponse mapToTheaterResponse(Theater theater) {
        TheaterResponse theaterResponse = new TheaterResponse();
        theaterResponse.setId(theater.getId());
        theaterResponse.setName(theater.getName());
        theaterResponse.setCity(theater.getCity());
        theaterResponse.setAddress(theater.getAddress());
        theaterResponse.setStatus(theater.getStatus());
        theaterResponse.setCreatedAt(theater.getCreatedAt());
        theaterResponse.setUpdatedAt(theater.getUpdatedAt());
        theaterResponse.setOwnerId(theater.getOwner().getId());
        theaterResponse.setOwnerName(theater.getOwner().getFirstName() + " " + theater.getOwner().getLastName());
        theaterResponse.setOwnerEmail(theater.getOwner().getEmail());
        return theaterResponse;
    }
    @Transactional
    public TheaterResponse create(CreateTheaterRequest request, User owner) {
        Theater theater = new Theater();
        theater.setName(request.getTheaterName());
        theater.setAddress(request.getAddress());
        theater.setCity(request.getCity());
        theater.setOwner(owner);

        createTheater(theater, owner);

        return mapToTheaterResponse(theater);
    }

    @Transactional
    public Page<TheaterResponse> listAll(String city, Pageable pageable) {

        if(city == null || city.isBlank()) {
           return theaterRepository.findAll(pageable).map(this::mapToTheaterResponse);
        }
        return theaterRepository.findByCity(city, pageable).map(this::mapToTheaterResponse);
    }

    @Transactional
    public TheaterResponse getById(Long id) {
        return mapToTheaterResponse(getEntityById(id));
    }

    @Transactional
    public void softDelete(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new TheaterNotFoundException(id));
        theater.setStatus(TheaterStatus.PERMANENTLY_CLOSED);
        theaterRepository.save(theater);
    }

    public Theater getEntityById(Long id) {
        return theaterRepository.findById(id)
                .orElseThrow(() -> new TheaterNotFoundException(id));
    }

    public Theater createTheater(Theater theater, User owner) {
        theater.setOwner(owner);
        return theaterRepository.save(theater);
    }

    @Transactional(readOnly = true)
    public List<TheaterResponse> listMine() {
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = Long.valueOf(currUserId);

        List<Theater> owned = theaterRepository.findByOwnerId(userId);
        List<Theater> staffed = theaterStaffRepository
                .findByUser_IdAndStatus(userId, EmploymentStatus.WORKING)
                .stream()
                .map(TheaterStaff::getTheater)
                .toList();

        Map<Long, Theater> byId = new LinkedHashMap<>();
        for (Theater theater : owned) {
            byId.put(theater.getId(), theater);
        }
        for (Theater theater : staffed) {
            byId.putIfAbsent(theater.getId(), theater);
        }

        return byId.values().stream().map(this::mapToTheaterResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<TheaterResponse> searchTheaters(String ownerName, String city, String theaterName, Pageable pageable) {
        Specification<Theater> spec = Specification
                .where(TheaterSpecifications.hasCity(city))
                .and(TheaterSpecifications.hasTheaterName(theaterName))
                .and(TheaterSpecifications.hasOwnerName(ownerName))
                .and(TheaterSpecifications.fetchOwner());

        return theaterRepository.findAll(spec, pageable).map(this::mapToTheaterResponse);
    }

}
