package dk.ek.workly.dto.adminDTO;
import lombok.Getter;
import lombok.Setter;
@Getter @Setter
public class AdminCreateEntrepreneurRequest {
    private String userName;
    private String userEmail;
    private String temporaryPassword;
    private String companyName;
    private String description;
    private String phone;
    private String businessEmail;
    private String location;
    private Long categoryId;
}
