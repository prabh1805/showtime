POST http://localhost:8080/api/v1/theaters
Content-Type: application/json

{"city":"Delhi","name":"PVR Saket","address":"Select Citywalk Mall","status":"OPERATIONAL"}

docker run -d \
--name postgres-db \
-e POSTGRES_USER=admin \
-e POSTGRES_PASSWORD=admin123 \
-e POSTGRES_DB=showtime \
-p 5433:5432 \
postgres:16