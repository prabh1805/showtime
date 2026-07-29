# Showtime

A Spring Boot backend for a movie showtime / ticket booking system — theaters, screens, movies, shows, seats, and seat bookings.

## Tech stack

- Java 21, Spring Boot 4 (Web MVC, Data JPA, Data MongoDB, Validation)
- PostgreSQL (relational data) + MongoDB (document data)
- Lombok, MapStruct
- Maven (with the Maven Wrapper, so no local Maven install is required)
- JaCoCo for test coverage

## Prerequisites

- JDK 21
- Docker (for a local PostgreSQL instance) or your own PostgreSQL server
- A running MongoDB instance

## Setup

### 1. Start PostgreSQL

```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=showtime \
  -p 5433:5432 \
  postgres:16
```

If the container already exists, just start it again with `docker start postgres-db`.

### 2. Start MongoDB

Point the app at any MongoDB instance you have running locally (e.g. `brew services start mongodb-community`) or via Docker:

```bash
docker run -d --name mongo-db -p 27017:27017 mongo:7
```

### 3. Configure environment variables

The app reads its datasource config from the environment — nothing is hardcoded:

```bash
export DB_URL=jdbc:postgresql://localhost:5433/showtime
export DB_USER=admin
export DB_PASSWORD=admin123
export MONGO_URI=mongodb://localhost:27017/showtime
```

## Running the app

```bash
./mvnw spring-boot:run
```

The app starts on `http://localhost:8080`. Hibernate DDL is set to `update`, so tables are created/updated automatically on startup.

## Running tests

```bash
./mvnw test
```

A JaCoCo coverage report is generated at `target/site/jacoco/index.html`.

## Example request

```bash
curl -X POST http://localhost:8080/api/v1/theaters \
  -H "Content-Type: application/json" \
  -d '{"city":"Delhi","name":"PVR Saket","address":"Select Citywalk Mall","status":"OPERATIONAL"}'
```

## Project structure

```
src/main/java/com/showtime/
├── common/     # shared config and exception handling
├── movie/
├── screen/
├── seat/
├── show/
├── showSeat/
└── theater/
```
