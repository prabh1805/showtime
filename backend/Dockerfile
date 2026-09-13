# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -q -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre AS run
WORKDIR /app

COPY --from=build /app/target/showtime-0.0.1-SNAPSHOT.jar app.jar

# Render (and most PaaS hosts) inject $PORT; fall back to 8081 for local `docker run`.
ENV PORT=8081
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
