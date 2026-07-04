package dk.ek.workly.dto.entrepreneurDTO;

import dk.ek.workly.model.EntrepreneurStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class EntrepreneurPortalResponse {

    private Long id;

    /*
     * Brugerens personlige loginoplysninger.
     */
    private String ownerName;
    private String loginEmail;

    /*
     * Virksomhedsoplysninger.
     */
    private String companyName;
    private String description;
    private String phone;
    private String businessEmail;
    private String location;

    /*
     * Kategoriinformation.
     */
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;

    /*
     * Profilens tilstand.
     */
    private EntrepreneurStatus status;
    private boolean active;
    private boolean availableForWork;

    private double rating;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}