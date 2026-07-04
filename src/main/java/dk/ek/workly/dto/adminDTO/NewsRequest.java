package dk.ek.workly.dto.adminDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewsRequest {
    private String title;
    private String summary;
    private String content;
    private String imageUrl;
    private boolean featured;
}
