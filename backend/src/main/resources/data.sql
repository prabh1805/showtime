-- Users
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES ('admin@showtime.com', '$2b$10$BMAMZM9gMnRmpXBinydO9O8Ynhr2aD1q9lx/qNO.WueCzfEmgN0Dm', 'ADMIN', now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES ('customer@gmail.com', '$2b$10$BMAMZM9gMnRmpXBinydO9O8Ynhr2aD1q9lx/qNO.WueCzfEmgN0Dm', 'CUSTOMER', now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES ('owner@gmail.com', '$2b$10$BMAMZM9gMnRmpXBinydO9O8Ynhr2aD1q9lx/qNO.WueCzfEmgN0Dm', 'THEATER_STAFF', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Theater (owned by the seeded owner, resolved by business key)
INSERT INTO theater (name, city, address, status, owner_id, created_at, updated_at)
SELECT 'Galaxy Cinemas', 'Delhi', '123 MG Road', 'OPERATIONAL', u.id, now(), now()
FROM users u
WHERE u.email = 'owner@gmail.com'
ON CONFLICT (name, city) DO NOTHING;