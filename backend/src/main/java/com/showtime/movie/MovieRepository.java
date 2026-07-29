package com.showtime.movie;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;

public interface MovieRepository extends MongoRepository<Movie, String> {
     boolean existsByTitleAndReleaseDate(String title, LocalDate releaseDate);
}
