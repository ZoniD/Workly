package dk.ek.workly.controller;

import dk.ek.workly.dto.CreateEntrepreneurRequest;
import dk.ek.workly.dto.EntrepreneurResponse;
import dk.ek.workly.service.EntrepreneurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrepreneurs")
public class EntrepreneurController {

    private final EntrepreneurService entrepreneurService;

    public EntrepreneurController(EntrepreneurService entrepreneurService) {
        this.entrepreneurService = entrepreneurService;
    }

    @GetMapping
    public List<EntrepreneurResponse> getEntrepreneurs(
            @RequestParam(required = false) Long categoryId) {

        return entrepreneurService.getApprovedEntrepreneurs(categoryId);
    }

    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestBody CreateEntrepreneurRequest request,
            Authentication authentication) {

        try {
            String email = authentication.getName();

            EntrepreneurResponse profile =
                    entrepreneurService.createProfile(request, email);

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}