package dk.ek.workly.controller;
import dk.ek.workly.dto.adminDTO.AdminCreateEntrepreneurRequest;
import dk.ek.workly.dto.adminDTO.AdminEntrepreneurResponse;
import dk.ek.workly.dto.entrepreneurDTO.UpdateEntrepreneurStatusRequest;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.service.EntrepreneurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/admin/entrepreneurs")
public class AdminEntrepreneurController {
    private final EntrepreneurService entrepreneurService;
    public AdminEntrepreneurController(EntrepreneurService entrepreneurService){this.entrepreneurService=entrepreneurService;}
    @GetMapping public List<AdminEntrepreneurResponse> getAll(@RequestParam(required=false) EntrepreneurStatus status){return entrepreneurService.getAllForAdmin(status);}
    @PostMapping public ResponseEntity<?> create(@RequestBody AdminCreateEntrepreneurRequest request){try{return ResponseEntity.status(HttpStatus.CREATED).body(entrepreneurService.createByAdmin(request));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @PatchMapping("/{id}/status") public ResponseEntity<?> updateStatus(@PathVariable Long id,@RequestBody UpdateEntrepreneurStatusRequest request){try{return ResponseEntity.ok(entrepreneurService.updateStatus(id,request.getStatus()));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @DeleteMapping("/{id}") public ResponseEntity<?> deactivate(@PathVariable Long id){try{return ResponseEntity.ok(entrepreneurService.deactivate(id));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @PatchMapping("/{id}/restore") public ResponseEntity<?> restore(@PathVariable Long id){try{return ResponseEntity.ok(entrepreneurService.restore(id));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
}
