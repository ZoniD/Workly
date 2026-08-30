package dk.ek.workly.controller;
import dk.ek.workly.dto.entrepreneurDTO.EntrepreneurPortalResponse;
import dk.ek.workly.dto.entrepreneurDTO.UpdateAvailabilityRequest;
import dk.ek.workly.dto.entrepreneurDTO.UpdateEntrepreneurProfileRequest;
import dk.ek.workly.service.EntrepreneurPortalService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/entrepreneur")
public class EntrepreneurPortalController {
    private final EntrepreneurPortalService portalService;
    public EntrepreneurPortalController(EntrepreneurPortalService portalService){this.portalService=portalService;}
    @GetMapping("/profile") public EntrepreneurPortalResponse getMyProfile(Authentication authentication){return portalService.getMyProfile(authentication.getName());}
    @PutMapping("/profile") public EntrepreneurPortalResponse updateMyProfile(@Valid @RequestBody UpdateEntrepreneurProfileRequest request,Authentication authentication){return portalService.updateMyProfile(authentication.getName(),request);}
    @PatchMapping("/availability") public EntrepreneurPortalResponse updateAvailability(@RequestBody UpdateAvailabilityRequest request,Authentication authentication){return portalService.updateAvailability(authentication.getName(),request);}
}
