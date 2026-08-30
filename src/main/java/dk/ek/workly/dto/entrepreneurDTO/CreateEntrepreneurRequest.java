package dk.ek.workly.dto.entrepreneurDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateEntrepreneurRequest {
    private String companyName;
    private String description;
    private String phone;
    private String email;
    private String location;
    private Long categoryId;
}
