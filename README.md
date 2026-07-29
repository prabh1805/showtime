docker run -d \
 --name postgres-db \
 -e POSTGRES_USER=admin \
 -e POSTGRES_PASSWORD=admin123 \
 -e POSTGRES_DB=showtime \
 -p 5433:5432 \
 postgres:16
