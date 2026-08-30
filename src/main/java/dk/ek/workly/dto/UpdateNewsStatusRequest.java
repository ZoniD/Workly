package dk.ek.workly.dto;
import dk.ek.workly.model.NewsStatus;
import lombok.Getter;
import lombok.Setter;
@Getter @Setter
public class UpdateNewsStatusRequest { private NewsStatus status; }
