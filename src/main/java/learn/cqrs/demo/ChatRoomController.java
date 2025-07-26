package learn.cqrs.demo;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("api/1.0.0/room")
@CrossOrigin(origins = "*")
public class ChatRoomController {
    @Autowired
    private ChatRoomService chatRoomService;

    @GetMapping
    public List<String> listRooms() {
        return chatRoomService.listRooms();
    }

    @PostMapping("/{name}")
    public String createRoom(@PathVariable String name) {
        return chatRoomService.createRoom(name);
    }

    @PostMapping("/{roomId}/message")
    public CompletableFuture<String> sendMessage(@PathVariable String roomId, @RequestBody ChatMessage message) {
        return chatRoomService.sendMessage(message.setRoomId(roomId));
    }

    @GetMapping(value = "/{roomId}/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<String> streamMessages(@PathVariable String roomId) {
        return chatRoomService.getMessages(roomId);
    }
}
