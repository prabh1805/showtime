package com.showtime.movie;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {
    private final MovieService movieService;
    private final TmdbMovieMapper tmdbMovieMapper;
    private final TmdbClientService tmdbClientService;

    @PostMapping("/upsertMovies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MovieBatchItemResult>> upsertMovie(@RequestBody List<Long> movieIds){
        List<MovieBatchItemResult> res = movieService.upsertMovies(movieIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/getPages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MovieSummaryResponse>> getMoviePages(
            @RequestParam(required = false) String title,
            Pageable pageable) {
        Page<Movie> movies = movieService.getMoviesPaginated(title, pageable);
        Page<MovieSummaryResponse> res = movies.map(tmdbMovieMapper::toSummaryResponse);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/getForUser")
    public ResponseEntity<List<MovieCatalogResponse>> getMovieCatalog(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<String> genre
    ){
        return ResponseEntity.ok(movieService.searchMovieForUser(title, genre));
    }

    @GetMapping("/getForStaff")
    @PreAuthorize("hasRole('STAFF') or hasRole('OWNER')")
    public ResponseEntity<List<MovieSummaryResponse>> getMovieForStaff(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<MovieStatus> status
    ){
        return ResponseEntity.ok(movieService.searchMoviesForStaff(title, status));
    }

    @GetMapping("/tmdbSearch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TmdbSearchResponse> searchTmdbMovies(@RequestParam String query) {
        return ResponseEntity.ok(tmdbClientService.searchMovies(query));
    }

    @GetMapping("/movieById/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieDetailResponse>  getMovieById(@PathVariable String id){
        return ResponseEntity.ok(movieService.getMovieById(id));
    }
}
