package com.showtime.show;

import com.showtime.movie.Movie;
import com.showtime.movie.MovieFormat;
import com.showtime.movie.MovieService;
import com.showtime.movie.MovieStatus;
import com.showtime.screen.Screen;
import com.showtime.screen.ScreenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowService {
    private final MovieService movieService;
    private final ScreenService  screenService;
    private final ShowRepository showRepository;
    private final ShowMapper showMapper;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public ShowResponse create(CreateShowRequest request) {
        Movie movie = movieService.getEntityById(request.getMovieId());
        Screen screen = screenService.getEntityById(request.getScreenId());


        if(movie.getStatus() == MovieStatus.ARCHIVED) {
            throw new MovieArchivedException(movie);
        }

        List<MovieFormat> availableFormats = movie.getAvailableFormats();
        if(!availableFormats.contains(request.getFormat())) {
            throw new InvalidShowFormatException(movie, request.getFormat());
        }

        List<String> availableLanguages = movie.getAvailableLanguages();
        if(!availableLanguages.contains(request.getLanguage())) {
            throw new InvalidShowLanguageException(movie, request.getLanguage());
        }

        LocalDateTime endTime = request.getStartTime().plusMinutes(
                movie.getDuration() + request.getIntervalMinutes() + screen.getBufferMinutes()
        );


        List<Show> overlappingShows = showRepository.findOverlappingShows(
                screen.getId(),
                request.getStartTime(),
                endTime
        );
        if(!overlappingShows.isEmpty()) {
            throw new ShowOverlapException(request.getStartTime(), endTime, screen);
        }

        Show show = showMapper.toEntity(request);
        show.setScreen(screen);
        show.setEndTime(endTime);

        Show showResult = showRepository.save(show);
        applicationEventPublisher.publishEvent(new ShowCreatedEvent(showResult.getId()));
        log.info("Show created successfully with ID: {}", showResult.getId());
        return showMapper.toResponse(showResult, movie, screen);
    }

    public Show getEntityById(Long id) {
        return showRepository.findById(id).orElseThrow(() -> new ShowNotFoundException(id));
    }
}
