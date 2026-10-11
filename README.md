# Showtime 🎬

A full-stack movie ticket booking platform — browse movies, pick seats on a live seat map, and pay online. Theater owners and staff get their own dashboards to manage screens, schedule shows, and track revenue.

**Live demo:** _coming soon_ <!-- TODO: add Vercel URL -->

<!-- TODO: add screenshots
![Movie catalog](docs/screenshots/catalog.png)
![Seat selection](docs/screenshots/seat-map.png)
![Owner dashboard](docs/screenshots/owner-dashboard.png)
-->

## What it does

- **Movie catalog** — movies imported from TMDB, with posters, details, and search.
- **Seat booking** — pick seats on a visual seat map that reflects live availability.
- **Safe concurrent checkout** — database row locking guarantees two people can never book the same seat; unpaid holds expire and are released automatically.
- **Online payments** — checkout, payment verification, webhooks, and automatic refunds.
- **Role-based dashboards**
  - **Customer** — book tickets and view booking history
  - **Owner** — manage theaters, screens, seat layouts, staff, and shows; view revenue analytics
  - **Staff** — manage screens and shows for their theater
  - **Admin** — onboard theater owners
- **Fast under load** — Redis caching on seat availability; load-tested with 500 concurrent requests at 100% success.

## Tech stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Recharts |
| Backend  | Java, Spring Boot, Spring Security (JWT)          |
| Data     | PostgreSQL, MongoDB (movie catalog), Redis (cache) |
| Payments | Razorpay                                          |
| Deploy   | Docker, Render (backend), Vercel (frontend)       |

## Run locally

**Prerequisites:** Java 21, Node 18+, Docker

1. **Start PostgreSQL**
   ```bash
   docker run -d --name postgres-db \
     -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=showtime \
     -p 5433:5432 postgres:16
   ```
   You'll also need a MongoDB and a Redis instance (local or free cloud tiers).

2. **Configure the backend**
   ```bash
   cd backend
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```
   Fill in your database, MongoDB, Redis, JWT, TMDB, and Razorpay (test mode) credentials.

3. **Run the backend** (http://localhost:8081)
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Run the frontend** (http://localhost:5173)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## More docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — system design, booking/payment flow, and design decisions
- [DEPLOYMENT.md](DEPLOYMENT.md) — step-by-step deployment to Render + Vercel
