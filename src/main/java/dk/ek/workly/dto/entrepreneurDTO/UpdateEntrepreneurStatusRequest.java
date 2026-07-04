package dk.ek.workly.dto.entrepreneurDTO;

import dk.ek.workly.model.EntrepreneurStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEntrepreneurStatusRequest {
    private EntrepreneurStatus status;
}
