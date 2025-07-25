package learn.cqrs.demo;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {
    
    private static final String ROOMS_KEY = "rooms";
    private static final String TOPIC = "chat-messages";
    private static final String CONSUMER_GROUP = "chat-messages-group";

    private final JsonHelper jsonHelper;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;


    public List<String> listRooms() {
        return Optional
            .ofNullable(redisTemplate.opsForSet())
            .map(ops -> ops.members(ROOMS_KEY))
            .map(rooms -> rooms.stream().toList())
            .orElse(List.of());
    }

    public String createRoom(String name) {
        redisTemplate.boundListOps(name).leftPush("Room %s has been created".formatted(name));
        redisTemplate.opsForSet().add(ROOMS_KEY, name);
        log.info("Created room {}", name);
        return name;
    }

    public CompletableFuture<String> sendMessage(ChatMessage message) {
        return CompletableFuture.supplyAsync(() -> {
            message.setTimestamp(System.currentTimeMillis());
            String payload = jsonHelper.toJson(message);
            log.info("Sending message to Kafka: {}", payload);
            return payload;
        }).thenCompose(kafkaPayload -> {
            return kafkaTemplate.send(TOPIC, kafkaPayload);
        }).thenApply(res -> {
            log.info("Sent message to Kafka: {}", res.getProducerRecord());
            return "success";
        }).exceptionally(ex -> {
            log.error("Failed to send message to Kafka", ex);
            return "failed";
        });
    }

    public List<String> getMessages(String roomId) {
        return Optional
            .ofNullable(redisTemplate.boundListOps(roomId))
            .map(roomMessages -> Optional.ofNullable(roomMessages.range(0, -1))
            .orElse(List.of()).stream()
            .map(jsonMessage-> 
                jsonHelper.fromJsonOptional(jsonMessage, new TypeReference<ChatMessage>(){})
                    .map(chatMessage-> "[%s]: %s".formatted(chatMessage.getSender(), chatMessage.getContent()))
                    .orElse(jsonMessage)).toList()
            )
            .orElse(List.of());
    }
    
    @KafkaListener(topics = TOPIC, groupId = CONSUMER_GROUP)
    public void listen(List<String> messages) {
        log.info("Received batch of {} messages from Kafka", messages.size());
        for (String messageStr : messages) {
            log.info("Processing message: {}", messageStr);
            
            Optional.ofNullable(jsonHelper
                .fromJson(messageStr, new TypeReference<ChatMessage>(){}))
                .ifPresentOrElse(msg-> {
                    String roomId = msg.getRoomId();
                    Optional.ofNullable(redisTemplate.boundListOps(roomId))
                    .ifPresentOrElse(roomMessages->{
                        // Add the message to the room's message list
                        roomMessages.leftPush(jsonHelper.toJson(msg));
                        log.info("Added message to room {}: {}", roomId, msg);
                    }, ()-> {
                        log.warn("Room {} does not exist, creating it", roomId);
                    });
                }, () -> {
                    log.error("Failed to deserialize message: {}", messageStr);
                });
        }
    }
}
