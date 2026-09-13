import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import FormError from "../components/FormError";
import BookingSeatGrid from "../components/BookingSeatGrid";
import { LoadingBlock } from "../components/Spinner";
import { getShowSeats } from "../api/shows";
import { createBooking, verifyPayment } from "../api/bookings";
import { loadRazorpayCheckout } from "../lib/razorpay";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";

/**
 * Customer checkout page: pick seats for a show, then pay via Razorpay
 * Checkout. Reached by direct route (`/shows/:showId/book`) — there's no
 * show-discovery UI yet, so this is linked to manually for now (e.g. from
 * the show id shown in the Owner/Staff "Shows" list).
 */
export default function BookShow() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [showSeats, setShowSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [payPending, setPayPending] = useState(false);
  const [payError, setPayError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const seats = await getShowSeats(showId, auth.accessToken);
        if (!cancelled) setShowSeats(seats);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load seats for this show.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [showId, auth.accessToken, refreshKey]);

  const selectedSeats = useMemo(
    () => showSeats.filter((s) => selectedIds.has(s.showSeatId)),
    [showSeats, selectedIds],
  );
  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + s.price, 0),
    [selectedSeats],
  );

  function toggleSeat(seat) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.showSeatId)) {
        next.delete(seat.showSeatId);
      } else {
        next.add(seat.showSeatId);
      }
      return next;
    });
  }

  async function handlePay() {
    setPayError("");
    setPayPending(true);

    let booking;
    try {
      booking = await createBooking(
        { showId: Number(showId), showSeatIds: [...selectedIds] },
        auth.accessToken,
      );
      await loadRazorpayCheckout();
    } catch (err) {
      setPayPending(false);
      if (err instanceof ApiError && err.status === 409) {
        setPayError(
          err.body?.message ?? "One or more selected seats were just taken.",
        );
        setSelectedIds(new Set());
        setRefreshKey((k) => k + 1);
      } else {
        setPayError(
          err instanceof ApiError ? err.body?.message : "Something went wrong.",
        );
      }
      return;
    }

    const razorpay = new window.Razorpay({
      key: booking.razorpayKeyId,
      amount: Math.round(booking.amount * 100),
      currency: booking.currency,
      order_id: booking.razorpayOrderId,
      name: "Showtime",
      description: `Booking #${booking.id}`,
      prefill: { email: auth.email ?? undefined },
      handler: async (response) => {
        try {
          const verified = await verifyPayment(
            booking.id,
            {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            auth.accessToken,
          );
          setResult(verified);
        } catch (err) {
          setPayError(
            err instanceof ApiError
              ? err.body?.message
              : "Payment verification failed.",
          );
        } finally {
          setPayPending(false);
        }
      },
      modal: {
        ondismiss: () => setPayPending(false),
      },
    });
    razorpay.open();
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl">
          Select your seats
        </h1>

        {result ? (
          <div className="rounded-lg border border-hairline bg-surface p-6 text-center shadow-sm sm:p-8">
            <p className="font-display text-xl font-bold text-marquee">
              Booking confirmed
            </p>
            <p className="mt-2 font-mono text-sm text-mist">
              Booking #{result.id} · ₹{result.amount} · {result.status}
            </p>
            <Button
              type="button"
              onClick={() => navigate("/customer")}
              className="mt-6 w-full sm:w-auto"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {loading ? (
              <LoadingBlock label="Loading seats…" />
            ) : loadError ? (
              <FormError message={loadError} />
            ) : (
              <>
                <BookingSeatGrid
                  showSeats={showSeats}
                  selectedIds={selectedIds}
                  onToggle={toggleSeat}
                />

                <FormError message={payError} />

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-hairline bg-surface p-4 shadow-sm">
                  <p className="font-mono text-sm text-ink">
                    {selectedSeats.length} seat
                    {selectedSeats.length === 1 ? "" : "s"} · ₹{totalPrice}
                  </p>
                  <Button
                    type="button"
                    onClick={handlePay}
                    pending={payPending}
                    pendingLabel="Processing…"
                    disabled={payPending || selectedSeats.length === 0}
                    className="w-auto"
                  >
                    Pay ₹{totalPrice}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
