package com.showtime.show;

import com.showtime.movie.Movie;
import com.showtime.movie.MovieService;
import com.showtime.screen.Screen;
import com.showtime.screen.ScreenService;
import com.showtime.showSeat.ShowSeat;
import com.showtime.showSeat.ShowSeatService;
import com.showtime.theater.TheaterService;
import com.showtime.theaterstaff.TheaterStaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowService {
    private final ScreenService screenService;
    private final MovieService movieService;
    private final ShowRepository showRepository;
    private final ShowSeatService showSeatService;
    private final TheaterStaffService theaterStaffService;
    private final TheaterService theaterService;

    @Transactional
    public ShowResponse createShow(CreateShowRequest createShowRequest) {
        Screen screen = screenService.getEntityById(createShowRequest.getScreenId());
        theaterStaffService.assertCallerCanManage(screen.getTheater(), "create shows for");
        Movie movie = movieService.getEntityById(createShowRequest.getMovieId());
        LocalDateTime endTime = createShowRequest.getShowTime().plusSeconds(movie.getDuration()).plusMinutes(screen.getBufferMinutes());
        boolean showOverlap = showRepository.existsOverlappingShow(
                createShowRequest.getScreenId(),
                createShowRequest.getShowTime(),
                endTime,
                ShowStatus.SCHEDULED
        );
        if(showOverlap) {
            throw new ShowOverlapException(
                    "Show already exists at time range from "
                    + createShowRequest.getShowTime()
                    + " to "
                    + endTime
            );
        }
        Show show = new Show();
        show.setFormat(createShowRequest.getFormat());
        show.setLanguage(createShowRequest.getLanguage());
        show.setMovieId(createShowRequest.getMovieId());
        show.setCategoryPricing(createShowRequest.getCategoryPricing());
        show.setEndTime(endTime);
        show.setScreen(screen);
        show.setShowTime(createShowRequest.getShowTime());
        // Show has no mapped association to ShowSeat (just a plain FK column), so Hibernate's
        // batched-insert ordering has no way to know the seats below depend on this row.
        // Flush now so the parent row is guaranteed committed-in-transaction before they're inserted.
        Show insertedShow = showRepository.saveAndFlush(show);

        List<ShowSeat> showSeats = showSeatService.createShowSeats(insertedShow, createShowRequest.getScreenId());

        ShowResponse showResponse = mapToResponse(insertedShow, movie);
        showResponse.setTotalSeatsCreated(showSeats.size());
        return showResponse;
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> listShowsByScreen(Long screenId) {
        screenService.getEntityById(screenId);
        List<Show> shows = showRepository.findAllByScreenIdOrderByShowTimeAsc(screenId);
        return shows.stream()
                .map(show -> mapToResponse(show, movieService.getEntityById(show.getMovieId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> listShowsByTheater(Long theaterId) {
        theaterService.getEntityById(theaterId);
        List<Show> shows = showRepository.findAllByScreen_Theater_IdOrderByShowTimeAsc(theaterId);
        return shows.stream()
                .map(show -> mapToResponse(show, movieService.getEntityById(show.getMovieId())))
                .toList();
    }

    public Show getEntityById(Long id) {
        return showRepository.findById(id)
                .orElseThrow(() -> new ShowNotFoundException(id));
    }

    private ShowResponse mapToResponse(Show show, Movie movie) {
        ShowResponse showResponse = new ShowResponse();
        showResponse.setId(show.getId());
        showResponse.setMovieId(show.getMovieId());
        showResponse.setMovieName(movie.getTitle());
        showResponse.setScreenId(show.getScreen().getId());
        showResponse.setScreenName(show.getScreen().getName());
        showResponse.setShowTime(show.getShowTime());
        showResponse.setEndTime(show.getEndTime());
        showResponse.setLanguage(show.getLanguage());
        showResponse.setFormat(show.getFormat());
        showResponse.setStatus(show.getStatus());
        return showResponse;
    }
}
