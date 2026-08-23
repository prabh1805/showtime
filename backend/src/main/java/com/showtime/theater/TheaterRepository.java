package com.showtime.theater;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TheaterRepository extends JpaRepository<Theater, Long>, JpaSpecificationExecutor<Theater> {
    Page<Theater> findByCity(String city, Pageable pageable);
    List<Theater> findByOwnerId(Long ownerId);
}
