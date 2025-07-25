package learn.cqrs.demo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@Accessors(chain = true)
@AllArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
    private long timestamp;
    private String roomId;
}
