package dk.ek.workly.dto.adminDTO;

import dk.ek.workly.model.EntrepreneurStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AdminEntrepreneurResponse {
    private Long id;
    private Long userId;
    private String ownerName;
    private String loginEmail;
    private String companyName;
    private String description;
    private String phone;
    private String businessEmail;
    private String location;
    private Long categoryId;
    private String categoryName;
    private EntrepreneurStatus status;
    private boolean active;
    private double rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
