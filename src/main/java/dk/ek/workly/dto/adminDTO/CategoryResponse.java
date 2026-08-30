package dk.ek.workly.dto.adminDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter @AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
}
