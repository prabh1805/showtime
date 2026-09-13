package com.showtime.showSeat;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.util.List;

/**
 * Read-through cache for the seat map of a show. Postgres stays the source of
 * truth for seat state; this only speeds up the hot "browse this show's seats"
 * read path, which many viewers hit while one booking is in progress. A short
 * TTL plus explicit eviction on every lock/book/release keeps it close to live,
 * and if the TTL window is ever missed the next read still self-heals from the DB.
 */
@Component
@Slf4j
public class ShowSeatCacheService {

    private static final String KEY_PREFIX = "show-seats:";
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${showseat.cache.ttl-seconds}")
    private long ttlSeconds;

    public ShowSeatCacheService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public List<ShowSeatResponse> get(Long showId) {
        try {
            String json = redisTemplate.opsForValue().get(key(showId));
            if (json == null) {
                return null;
            }
            return MAPPER.readValue(json,
                    MAPPER.getTypeFactory().constructCollectionType(List.class, ShowSeatResponse.class));
        } catch (Exception e) {
            log.warn("Show-seat cache read failed for show {}, falling back to DB: {}", showId, e.getMessage());
            return null;
        }
    }

    public void put(Long showId, List<ShowSeatResponse> showSeats) {
        try {
            String json = MAPPER.writeValueAsString(showSeats);
            redisTemplate.opsForValue().set(key(showId), json, Duration.ofSeconds(ttlSeconds));
        } catch (Exception e) {
            log.warn("Show-seat cache write failed for show {}: {}", showId, e.getMessage());
        }
    }

    public void evict(Long showId) {
        try {
            redisTemplate.delete(key(showId));
        } catch (Exception e) {
            log.warn("Show-seat cache eviction failed for show {}: {}", showId, e.getMessage());
        }
    }

    private String key(Long showId) {
        return KEY_PREFIX + showId;
    }
}
