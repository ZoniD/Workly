package dk.ek.workly.dto.entrepreneurDTO;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EntrepreneurResponse {

    private Long id;
    private String companyName;
    private String description;
    private String phone;
    private String email;
    private String location;

    private Long categoryId;
    private String categoryName;
    private String categoryIcon;

    private double rating;

    private boolean availableForWork;
}

