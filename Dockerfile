FROM maven:3.9.7-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY src src
RUN ls -lR /build && chmod +x mvnw && ./mvnw clean package -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
# Copy only the built jar from the builder image
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
