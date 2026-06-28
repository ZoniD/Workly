package dk.ek.workly.service;

import dk.ek.workly.dto.CreateEntrepreneurRequest;
import dk.ek.workly.dto.EntrepreneurResponse;
import dk.ek.workly.model.Category;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.CategoryRepository;
import dk.ek.workly.repository.EntrepreneurRepository;
import dk.ek.workly.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntrepreneurService {

    private final EntrepreneurRepository entrepreneurRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public EntrepreneurService(
            EntrepreneurRepository entrepreneurRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.entrepreneurRepository = entrepreneurRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<EntrepreneurResponse> getApprovedEntrepreneurs(Long categoryId) {
        List<Entrepreneur> entrepreneurs = categoryId == null
                ? entrepreneurRepository.findByApprovedTrueOrderByRatingDesc()
                : entrepreneurRepository.findByApprovedTrueAndCategoryIdOrderByRatingDesc(categoryId);

        return entrepreneurs.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EntrepreneurResponse createProfile(
            CreateEntrepreneurRequest request,
            String authenticatedEmail) {

        validateRequest(request);

        User user = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Brugeren blev ikke fundet"));

        if (entrepreneurRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Brugeren har allerede en virksomhedsprofil");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .filter(Category::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Kategorien findes ikke"));

        Entrepreneur entrepreneur = new Entrepreneur();
        entrepreneur.setUser(user);
        entrepreneur.setCompanyName(request.getCompanyName().trim());
        entrepreneur.setDescription(trimOrEmpty(request.getDescription()));
        entrepreneur.setPhone(trimOrEmpty(request.getPhone()));
        entrepreneur.setEmail(trimOrEmpty(request.getEmail()));
        entrepreneur.setLocation(request.getLocation().trim());
        entrepreneur.setCategory(category);
        entrepreneur.setApproved(false);
        entrepreneur.setRating(0.0);

        user.setRole(Role.ENTREPRENEUR);
        userRepository.save(user);

        return toResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public EntrepreneurResponse setApproval(Long id, boolean approved) {
        Entrepreneur entrepreneur = entrepreneurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Virksomhedsprofilen findes ikke"));

        entrepreneur.setApproved(approved);
        return toResponse(entrepreneurRepository.save(entrepreneur));
    }

    private EntrepreneurResponse toResponse(Entrepreneur entrepreneur) {
        Category category = entrepreneur.getCategory();

        return new EntrepreneurResponse(
                entrepreneur.getId(),
                entrepreneur.getCompanyName(),
                entrepreneur.getDescription(),
                entrepreneur.getPhone(),
                entrepreneur.getEmail(),
                entrepreneur.getLocation(),
                category.getId(),
                category.getName(),
                category.getIcon(),
                entrepreneur.getRating()
        );
    }

    private void validateRequest(CreateEntrepreneurRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Profildata mangler");
        }
        if (isBlank(request.getCompanyName())) {
            throw new IllegalArgumentException("Virksomhedsnavn skal udfyldes");
        }
        if (isBlank(request.getLocation())) {
            throw new IllegalArgumentException("Område skal udfyldes");
        }
        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Vælg en kategori");
        }
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
