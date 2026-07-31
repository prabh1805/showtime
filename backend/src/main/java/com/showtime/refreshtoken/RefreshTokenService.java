package com.showtime.refreshtoken;

import com.showtime.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;


@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    @Value("${refresh.token.expiration}")
    private Long refreshExpiration;

    public String issueToken(User user){
        String rawToken = generateRawToken();
        String hashToken;
        try {
            hashToken = generateHashToken(rawToken);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating token hash", e);
        }

        RefreshToken refreshToken = new  RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken);
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshExpiration));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    public RefreshResult refreshAndRotate(String rawToken) {
        String hashToken;
        try {
            hashToken = generateHashToken(rawToken);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating token hash", e);
        }

        RefreshToken token = refreshTokenRepository.findByTokenHash(hashToken)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (token.isRevoked()) {
            throw new InvalidRefreshTokenException();
        }

        if (Instant.now().isAfter(token.getExpiresAt())) {
            throw new InvalidRefreshTokenException();
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();
        String newRawToken = issueToken(user);

        return new RefreshResult(user, newRawToken);
    }

    public void revokeToken(String token) {
        String hashToken;
        try {
            hashToken = generateHashToken(token);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating token hash", e);
        }
        refreshTokenRepository.findByTokenHash(hashToken)
                .ifPresent(existing -> {
                    existing.setRevoked(true);
                    refreshTokenRepository.save(existing);
                });
    }

    private String generateRawToken(){
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateHashToken(String rawToken) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes= digest.digest(rawToken.getBytes());
        return Base64.getEncoder().encodeToString(hashBytes);
    }
}
