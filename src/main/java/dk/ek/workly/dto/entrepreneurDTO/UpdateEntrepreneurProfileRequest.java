package dk.ek.workly.dto.entrepreneurDTO;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateEntrepreneurProfileRequest {
    @NotBlank(message = "Virksomhedsnavn er påkrævet")
    @Size(max = 120, message = "Virksomhedsnavnet må højst være 120 tegn")
    private String companyName;
    @Size(max = 2000, message = "Beskrivelsen må højst være 2000 tegn")
    private String description;
    @NotBlank(message = "Telefonnummer er påkrævet")
    @Size(max = 30, message = "Telefonnummeret må højst være 30 tegn")
    private String phone;
    @NotBlank(message = "Virksomhedens email er påkrævet")
    @Email(message = "Indtast en gyldig email")
    @Size(max = 150, message = "Emailen må højst være 150 tegn")
    private String businessEmail;
    @NotBlank(message = "Område er påkrævet")
    @Size(max = 120, message = "Området må højst være 120 tegn")
    private String location;
}
