package com.showtime.booking;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
@Slf4j
public class RazorpayGatewayService {

    private static final String CURRENCY = "INR";

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.api.secret}")
    private String razorpayApiSecret;

    @Value("${razorpay.webhook.secret}")
    private String razorpayWebhookSecret;

    public RazorpayOrder createOrder(BigDecimal amount, String receipt) {
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", CURRENCY);
        orderRequest.put("receipt", receipt);

        try {
            Order order = razorpayClient.orders.create(orderRequest);
            return new RazorpayOrder(order.get("id"), CURRENCY, amountInPaise);
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for receipt {}", receipt, e);
            throw new PaymentGatewayException("Could not create payment order: " + e.getMessage());
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        try {
            return Utils.verifyPaymentSignature(options, razorpayApiSecret);
        } catch (RazorpayException e) {
            log.warn("Razorpay signature verification failed for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        if (signature == null) {
            return false;
        }
        try {
            return Utils.verifyWebhookSignature(payload, signature, razorpayWebhookSecret);
        } catch (RazorpayException e) {
            log.warn("Razorpay webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Full refund of a captured payment. No "amount" is sent, which Razorpay
     * treats as a request to refund the entire captured amount.
     */
    public String refundPayment(String paymentId, String reason) {
        JSONObject notes = new JSONObject();
        notes.put("reason", reason);
        JSONObject refundRequest = new JSONObject();
        refundRequest.put("notes", notes);

        try {
            Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);
            return refund.get("id");
        } catch (RazorpayException e) {
            log.error("Failed to refund Razorpay payment {}: {}", paymentId, e.getMessage());
            throw new PaymentGatewayException("Could not refund payment " + paymentId + ": " + e.getMessage());
        }
    }
}
