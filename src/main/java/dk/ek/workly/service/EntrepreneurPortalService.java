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

    public EntrepreneurPortalService(
            EntrepreneurRepository entrepreneurRepository) {

        this.entrepreneurRepository = entrepreneurRepository;
    }

    /*
     * Henter den loggede fagpersons egen profil.
     */
    @Transactional(readOnly = true)
    public EntrepreneurPortalResponse getMyProfile(
            String authenticatedEmail) {

        Entrepreneur entrepreneur =
                findApprovedProfile(authenticatedEmail);

        return toResponse(entrepreneur);
    }

    /*
     * Opdaterer fagpersonens offentlige profiloplysninger.
     */
    @Transactional
    public EntrepreneurPortalResponse updateMyProfile(
            String authenticatedEmail,
            UpdateEntrepreneurProfileRequest request) {

        Entrepreneur entrepreneur =
                findApprovedProfile(authenticatedEmail);

        entrepreneur.setCompanyName(
                request.getCompanyName().trim()
        );

        entrepreneur.setDescription(
                trimOrEmpty(request.getDescription())
        );

        entrepreneur.setPhone(
                request.getPhone().trim()
        );

        entrepreneur.setEmail(
                request.getBusinessEmail()
                        .trim()
                        .toLowerCase()
        );

        entrepreneur.setLocation(
                request.getLocation().trim()
        );

        Entrepreneur savedEntrepreneur =
                entrepreneurRepository.save(entrepreneur);

        return toResponse(savedEntrepreneur);
    }

    /*
     * Ændrer om fagpersonen tager imod nye opgaver.
     */
    @Transactional
    public EntrepreneurPortalResponse updateAvailability(
            String authenticatedEmail,
            UpdateAvailabilityRequest request) {

        Entrepreneur entrepreneur =
                findApprovedProfile(authenticatedEmail);

        entrepreneur.setAvailableForWork(
                request.isAvailableForWork()
        );

        Entrepreneur savedEntrepreneur =
                entrepreneurRepository.save(entrepreneur);

        return toResponse(savedEntrepreneur);
    }

    /*
     * Finder profilen gennem den email, som JWT-filteret
     * har lagt i Authentication.
     */
    private Entrepreneur findApprovedProfile(
            String authenticatedEmail) {

        Entrepreneur entrepreneur =
                entrepreneurRepository
                        .findByUser_EmailIgnoreCase(
                                authenticatedEmail
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Der blev ikke fundet en fagpersonprofil"
                                )
                        );

        /*
         * En PENDING, REJECTED eller SUSPENDED profil
         * må ikke bruge fagpersonportalen.
         */
        if (entrepreneur.getStatus()
                != EntrepreneurStatus.APPROVED) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Fagpersonprofilen er ikke godkendt"
            );
        }

        return entrepreneur;
    }

    /*
     * Konverterer entity til DTO.
     */
    private EntrepreneurPortalResponse toResponse(
            Entrepreneur entrepreneur) {

        return EntrepreneurPortalResponse.builder()
                .id(entrepreneur.getId())

                .ownerName(
                        entrepreneur.getUser().getName()
                )

                .loginEmail(
                        entrepreneur.getUser().getEmail()
                )

                .companyName(
                        entrepreneur.getCompanyName()
                )

                .description(
                        entrepreneur.getDescription()
                )

                .phone(
                        entrepreneur.getPhone()
                )

                .businessEmail(
                        entrepreneur.getEmail()
                )

                .location(
                        entrepreneur.getLocation()
                )

                .categoryId(
                        entrepreneur.getCategory().getId()
                )

                .categoryName(
                        entrepreneur.getCategory().getName()
                )

                .categoryIcon(
                        entrepreneur.getCategory().getIcon()
                )

                .status(
                        entrepreneur.getStatus()
                )

                .active(
                        entrepreneur.isActive()
                )

                .availableForWork(
                        entrepreneur.isAvailableForWork()
                )

                .rating(
                        entrepreneur.getRating()
                )

                .createdAt(
                        entrepreneur.getCreatedAt()
                )

                .updatedAt(
                        entrepreneur.getUpdatedAt()
                )

                .build();
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}