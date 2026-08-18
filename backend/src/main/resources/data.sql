INSERT INTO users (email, password_hash, first_name, last_name, mobile_number, created_at, updated_at, role)
VALUES (
           'admin@showtime.com',
           '$2a$12$nMf9qz3r8WnpPnqWVdXTreT6G2AKNe9WGku4p5CXvDnsx8IW/sCaC',
           'System',
           'Admin',
           NULL,
           NOW(),
           NOW(),
           'ADMIN'
       );