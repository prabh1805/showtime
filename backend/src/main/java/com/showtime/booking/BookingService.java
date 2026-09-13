package com.showtime.booking;

import com.showtime.show.Show;
import com.showtime.show.ShowService;
import com.showtime.showSeat.ShowSeat;
import com.showtime.showSeat.ShowSeatService;
import com.showtime.user.User;
import com.showtime.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowService showService;
    private final ShowSeatService showSeatService;
    private final UserService userService;
    private final RazorpayGatewayService razorpayGatewayService;

    @Value("${razorpay.api.key}")
    private String razorpayKeyId;

    @Value("${booking.hold.expiration}")
    private long bookingHoldExpirationMs;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User user = getCurrentUser();
        Show show = showService.getEntityById(request.getShowId());

        List<ShowSeat> lockedSeats = showSeatService.lockAvailableSeats(
                show.getId(), request.getShowSeatIds(), user.getId());

        BigDecimal amount = lockedSeats.stream()
                .map(ShowSeat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String receipt = "booking-" + UUID.randomUUID();
        RazorpayOrder razorpayOrder = razorpayGatewayService.createOrder(amount, receipt);

        Booking booking = new Booking();
        booking.setShow(show);
        booking.setUser(user);
        booking.setAmount(amount);
        booking.setRazorpayOrderId(razorpayOrder.orderId());
        booking.setStatus(BookingStatus.INITIATED);
        booking.setExpiresAt(Instant.now().plusMillis(bookingHoldExpirationMs));
        Booking savedBooking = bookingRepository.save(booking);

        showSeatService.assignBooking(lockedSeats, savedBooking.getId());

        return mapToResponse(savedBooking, razorpayOrder.currency());
    }

    @Transactional
    public BookingResponse verifyPayment(Long bookingId, VerifyPaymentRequest request) {
        Booking booking = getOwnedBooking(bookingId);

        if (booking.getStatus() != BookingStatus.INITIATED) {
            throw new InvalidBookingStateException(bookingId, booking.getStatus());
        }

        if (Instant.now().isAfter(booking.getExpiresAt())) {
            expireBooking(booking);
            throw new BookingExpiredException(bookingId);
        }

        if (!booking.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new PaymentVerificationException("razorpayOrderId does not match this booking");
        }

        boolean signatureValid = razorpayGatewayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if (!signatureValid) {
            markFailed(booking, "Invalid payment signature");
            throw new PaymentVerificationException("Payment signature verification failed");
        }

        markSuccess(booking, request.getRazorpayPaymentId());
        return mapToResponse(booking, "INR");
    }

    /**
     * Razorpay's server-to-server callback — the source of truth for payment status.
     * The client-driven {@link #verifyPayment} confirms a booking as soon as the
     * checkout redirect returns, but a dropped connection there must not leave a
     * paid booking stuck as INITIATED, so this event finalizes it independently.
     */
    @Transactional
    public void processWebhookEvent(String payload, String signature) {
        if (!razorpayGatewayService.verifyWebhookSignature(payload, signature)) {
            throw new WebhookVerificationException("Invalid Razorpay webhook signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event", "");
        JSONObject payment = extractPaymentEntity(event);

        switch (eventType) {
            case "payment.captured", "order.paid" -> handlePaymentCaptured(payment);
            case "payment.failed" -> handlePaymentFailed(payment);
            default -> log.info("Ignoring unhandled Razorpay webhook event: {}", eventType);
        }
    }

    private void handlePaymentCaptured(JSONObject payment) {
        Booking booking = findBookingForWebhookPayment(payment);
        if (booking == null) {
            return;
        }
        if (booking.getStatus() != BookingStatus.INITIATED) {
            log.warn("Received payment.captured for booking {} already in status {}; " +
                    "refunding it since its seats are no longer held",
                    booking.getId(), booking.getStatus());
            refundStaleCapture(booking, payment.optString("id", null));
            return;
        }
        markSuccess(booking, payment.optString("id", null));
    }

    /**
     * A capture that lands after the booking already moved to a terminal state
     * (its hold expired, or /verify already marked it FAILED) means we can no
     * longer honor it — the seats may already be someone else's. Refund the
     * charge in full rather than leave the customer paid for nothing.
     */
    private void refundStaleCapture(Booking booking, String paymentId) {
        if (paymentId == null || booking.getRazorpayRefundId() != null) {
            return;
        }
        String refundId = razorpayGatewayService.refundPayment(
                paymentId,
                "Booking " + booking.getId() + " was already " + booking.getStatus() + " when payment was captured");
        booking.setRazorpayPaymentId(paymentId);
        booking.setRazorpayRefundId(refundId);
        bookingRepository.save(booking);
    }

    private void handlePaymentFailed(JSONObject payment) {
        Booking booking = findBookingForWebhookPayment(payment);
        if (booking == null) {
            return;
        }
        if (booking.getStatus() != BookingStatus.INITIATED) {
            log.info("Ignoring payment.failed for booking {} already in status {}",
                    booking.getId(), booking.getStatus());
            return;
        }
        markFailed(booking, payment.optString("error_description", "Payment failed"));
    }

    private Booking findBookingForWebhookPayment(JSONObject payment) {
        if (payment == null) {
            log.warn("Razorpay webhook event had no payment entity in its payload");
            return null;
        }
        String orderId = payment.optString("order_id", null);
        if (orderId == null) {
            return null;
        }
        return bookingRepository.findByRazorpayOrderId(orderId).orElse(null);
    }

    private JSONObject extractPaymentEntity(JSONObject event) {
        JSONObject payload = event.optJSONObject("payload");
        JSONObject payment = payload == null ? null : payload.optJSONObject("payment");
        return payment == null ? null : payment.optJSONObject("entity");
    }

    private void markSuccess(Booking booking, String paymentId) {
        booking.setRazorpayPaymentId(paymentId);
        booking.setStatus(BookingStatus.SUCCESS);
        bookingRepository.save(booking);
        showSeatService.markBooked(booking.getId());
    }

    private void markFailed(Booking booking, String reason) {
        booking.setStatus(BookingStatus.FAILED);
        booking.setFailureReason(reason);
        bookingRepository.save(booking);
        showSeatService.releaseSeats(booking.getId());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long bookingId) {
        Booking booking = getOwnedBooking(bookingId);
        return mapToResponse(booking, "INR");
    }

    private void expireBooking(Booking booking) {
        booking.setStatus(BookingStatus.EXPIRED);
        bookingRepository.save(booking);
        showSeatService.releaseSeats(booking.getId());
    }

    /**
     * Reaper for holds nobody ever finished: a booking whose client never called
     * /verify and for which Razorpay never fired a webhook (no payment was ever
     * attempted) would otherwise sit INITIATED with its seats LOCKED forever.
     */
    @Scheduled(fixedDelayString = "${booking.reaper.interval}")
    @Transactional
    public void releaseExpiredBookings() {
        List<Booking> expiredBookings = bookingRepository.findAllByStatusAndExpiresAtBefore(
                BookingStatus.INITIATED, Instant.now());
        for (Booking booking : expiredBookings) {
            expireBooking(booking);
        }
        if (!expiredBookings.isEmpty()) {
            log.info("Released {} expired booking hold(s)", expiredBookings.size());
        }
    }

    private Booking getOwnedBooking(Long bookingId) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedBookingAccessException(bookingId);
        }
        return booking;
    }

    private User getCurrentUser() {
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userService.getEntityById(Long.valueOf(currUserId));
    }

    private BookingResponse mapToResponse(Booking booking, String currency) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setShowId(booking.getShow().getId());
        response.setAmount(booking.getAmount());
        response.setCurrency(currency);
        response.setRazorpayOrderId(booking.getRazorpayOrderId());
        response.setRazorpayKeyId(razorpayKeyId);
        response.setStatus(booking.getStatus());
        response.setExpiresAt(booking.getExpiresAt());
        return response;
    }
}
