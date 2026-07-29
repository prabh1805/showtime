package com.showtime.show;

import com.showtime.showSeat.ShowSeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShowEventListener {
    private final ShowSeatService  showSeatService;
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onShowCreated(ShowCreatedEvent event) {
        log.info("Listener triggered for show {} on thread {}", event.showId(), Thread.currentThread().getName());
        showSeatService.createSeatsForShow(event.showId());

    }
}
