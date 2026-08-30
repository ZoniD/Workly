package dk.ek.workly.dto.userDTO;
import dk.ek.workly.model.NewsStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;
@Getter @AllArgsConstructor
public class NewsResponse {
    private Long id;
    private String title;
    private String summary;
    private String content;
    private String imageUrl;
    private boolean featured;
    private NewsStatus status;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
}
