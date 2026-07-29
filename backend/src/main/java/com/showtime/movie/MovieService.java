package com.showtime.movie;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;
    private final MongoTemplate mongoTemplate;
    private final MovieBatchService movieBatchService;

    public MovieResponse create(CreateMovieRequest request) {
        if(movieRepository.existsByTitleAndReleaseDate(request.getTitle(), request.getReleaseDate())) {
            throw new MovieAlreadyExistsException(request.getTitle(), request.getReleaseDate());
        }
        Movie movie = movieMapper.toEntity(request);
        Movie result = movieRepository.save(movie);
        return movieMapper.toResponse(result);
    }

    public MovieBatchResponse createBatch(BulkCreateMovieRequest request) {
        return movieBatchService.createBatch(request);
    }

    public Movie getEntityById(String movieId) {
        return movieRepository.findById(movieId).orElseThrow(() -> new MovieNotFoundException(movieId));
    }
}
