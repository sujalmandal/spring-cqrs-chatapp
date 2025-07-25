# Demo CQRS Chat Application

This project is a simple demo of a chat application using the CQRS (Command Query Responsibility Segregation) pattern, built with Java and Spring Boot.

## Features
- Basic chat room functionality
- Separation of command and query responsibilities
- RESTful API endpoints

## Project Structure
- `src/main/java/learn/cqrs/demo/` - Main Java source code
- `src/main/resources/` - Application configuration
- `src/test/java/learn/demo/demo/` - Test cases
- `pom.xml` - Maven project configuration

## Getting Started

### Prerequisites
- Java 17 or later
- Maven 3.6+

### Build and Run

```
./mvnw spring-boot:run
```

The application will start on [http://localhost:8080](http://localhost:8080).

### API Endpoints
- `POST /chat/rooms/{roomId}/messages` - Send a message to a chat room
- `GET /chat/rooms/{roomId}/messages` - Get messages from a chat room

## License
This project is for demonstration purposes only.
