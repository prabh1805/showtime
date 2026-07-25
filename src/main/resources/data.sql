-- Theater
INSERT INTO theater (name, city, address, status, created_at, updated_at)
VALUES ('Galaxy Cinemas', 'Delhi', '123 MG Road', 'OPERATIONAL', now(), now())
ON CONFLICT (name, city) DO NOTHING;

-- Screen 2
INSERT INTO screen (name, type, status, buffer_minutes, theater_id, created_at, updated_at)
SELECT 'Screen 2', 'IMAX', 'OPERATIONAL', 20, t.id, now(), now()
FROM theater t
WHERE t.name = 'Galaxy Cinemas' AND t.city = 'Delhi'
ON CONFLICT (theater_id, name) DO NOTHING;

-- Seats for Screen 1 (20 total)
INSERT INTO seat (seat_row, number, type, status, screen_id, created_at, updated_at)
SELECT v.seat_row, v.number, v.type, 'AVAILABLE', s.id, now(), now()
FROM screen s
         CROSS JOIN (VALUES
                         ('A', 1, 'REGULAR'), ('A', 2, 'REGULAR'), ('A', 3, 'REGULAR'), ('A', 4, 'REGULAR'), ('A', 5, 'REGULAR'),
                         ('B', 1, 'REGULAR'), ('B', 2, 'REGULAR'), ('B', 3, 'REGULAR'), ('B', 4, 'REGULAR'), ('B', 5, 'REGULAR'),
                         ('C', 1, 'PREMIUM'), ('C', 2, 'PREMIUM'), ('C', 3, 'PREMIUM'), ('C', 4, 'PREMIUM'), ('C', 5, 'PREMIUM'),
                         ('D', 1, 'RECLINER'), ('D', 2, 'RECLINER'), ('D', 3, 'RECLINER'), ('D', 4, 'RECLINER'), ('D', 5, 'RECLINER')
) AS v(seat_row, number, type)
WHERE s.name = 'Screen 1'
ON CONFLICT (screen_id, seat_row, number) DO NOTHING;

-- Seats for Screen 2 (20 total)
INSERT INTO seat (seat_row, number, type, status, screen_id, created_at, updated_at)
SELECT v.seat_row, v.number, v.type, 'AVAILABLE', s.id, now(), now()
FROM screen s
         CROSS JOIN (VALUES
                         ('A', 1, 'REGULAR'), ('A', 2, 'REGULAR'), ('A', 3, 'REGULAR'), ('A', 4, 'REGULAR'), ('A', 5, 'REGULAR'),
                         ('B', 1, 'REGULAR'), ('B', 2, 'REGULAR'), ('B', 3, 'REGULAR'), ('B', 4, 'REGULAR'), ('B', 5, 'REGULAR'),
                         ('C', 1, 'PREMIUM'), ('C', 2, 'PREMIUM'), ('C', 3, 'PREMIUM'), ('C', 4, 'PREMIUM'), ('C', 5, 'PREMIUM'),
                         ('D', 1, 'RECLINER'), ('D', 2, 'RECLINER'), ('D', 3, 'RECLINER'), ('D', 4, 'RECLINER'), ('D', 5, 'RECLINER')
) AS v(seat_row, number, type)
WHERE s.name = 'Screen 2'
ON CONFLICT (screen_id, seat_row, number) DO NOTHING;