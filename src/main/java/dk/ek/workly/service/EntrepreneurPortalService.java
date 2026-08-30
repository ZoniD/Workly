package dk.ek.workly.service;

import dk.ek.workly.dto.entrepreneurDTO.EntrepreneurPortalResponse;
import dk.ek.workly.dto.entrepreneurDTO.UpdateAvailabilityRequest;
import dk.ek.workly.dto.entrepreneurDTO.UpdateEntrepreneurProfileRequest;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.repository.EntrepreneurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EntrepreneurPortalService {
    private final EntrepreneurRepository entrepreneurRepository;
    public EntrepreneurPortalService(EntrepreneurRepository entrepreneurRepository) { this.entrepreneurRepository = entrepreneurRepository; }

    @Transactional(readOnly = true)
    public EntrepreneurPortalResponse getMyProfile(String authenticatedEmail) {
        return toResponse(findApprovedProfile(authenticatedEmail));
    }

    @Transactional
    public EntrepreneurPortalResponse updateMyProfile(String authenticatedEmail, UpdateEntrepreneurProfileRequest request) {
        Entrepreneur entrepreneur = findApprovedProfile(authenticatedEmail);
        entrepreneur.setCompanyName(request.getCompanyName().trim());
        entrepreneur.setDescription(trimOrEmpty(request.getDescription()));
        entrepreneur.setPhone(request.getPhone().trim());
        entrepreneur.setEmail(request.getBusinessEmail().trim().toLowerCase());
        entrepreneur.setLocation(request.getLocation().trim());
        return toResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public EntrepreneurPortalResponse updateAvailability(String authenticatedEmail, UpdateAvailabilityRequest request) {
        Entrepreneur entrepreneur = findApprovedProfile(authenticatedEmail);
        entrepreneur.setAvailableForWork(request.isAvailableForWork());
        return toResponse(entrepreneurRepository.save(entrepreneur));
    }

    private Entrepreneur findApprovedProfile(String authenticatedEmail) {
        Entrepreneur entrepreneur = entrepreneurRepository.findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Der blev ikke fundet en fagpersonprofil"));
        if (entrepreneur.getStatus() != EntrepreneurStatus.APPROVED)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Fagpersonprofilen er ikke godkendt");
        return entrepreneur;
    }

    private EntrepreneurPortalResponse toResponse(Entrepreneur entrepreneur) {
        return EntrepreneurPortalResponse.builder()
                .id(entrepreneur.getId())
                .ownerName(entrepreneur.getUser().getName())
                .loginEmail(entrepreneur.getUser().getEmail())
                .companyName(entrepreneur.getCompanyName())
                .description(entrepreneur.getDescription())
                .phone(entrepreneur.getPhone())
                .businessEmail(entrepreneur.getEmail())
                .location(entrepreneur.getLocation())
                .categoryId(entrepreneur.getCategory().getId())
                .categoryName(entrepreneur.getCategory().getName())
                .categoryIcon(entrepreneur.getCategory().getIcon())
                .status(entrepreneur.getStatus())
                .active(entrepreneur.isActive())
                .availableForWork(entrepreneur.isAvailableForWork())
                .rating(entrepreneur.getRating())
                .createdAt(entrepreneur.getCreatedAt())
                .updatedAt(entrepreneur.getUpdatedAt())
                .build();
    }

    private String trimOrEmpty(String value) { return value == null ? "" : value.trim(); }
}
