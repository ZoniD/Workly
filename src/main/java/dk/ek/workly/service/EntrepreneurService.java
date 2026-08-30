package dk.ek.workly.service;

import dk.ek.workly.dto.adminDTO.AdminCreateEntrepreneurRequest;
import dk.ek.workly.dto.adminDTO.AdminEntrepreneurResponse;
import dk.ek.workly.dto.entrepreneurDTO.EntrepreneurResponse;
import dk.ek.workly.dto.entrepreneurDTO.CreateEntrepreneurRequest;
import dk.ek.workly.model.Category;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.CategoryRepository;
import dk.ek.workly.repository.EntrepreneurRepository;
import dk.ek.workly.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntrepreneurService {

    private final EntrepreneurRepository entrepreneurRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EntrepreneurService(
            EntrepreneurRepository entrepreneurRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.entrepreneurRepository = entrepreneurRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public List<EntrepreneurResponse> getApprovedEntrepreneurs(Long categoryId) {
        List<Entrepreneur> entrepreneurs = categoryId == null
                ? entrepreneurRepository.findByStatusAndActiveTrueOrderByRatingDesc(EntrepreneurStatus.APPROVED)
                : entrepreneurRepository.findByStatusAndActiveTrueAndCategory_IdOrderByRatingDesc(
                EntrepreneurStatus.APPROVED, categoryId);

        return entrepreneurs.stream().map(this::toPublicResponse).toList();
    }

    @Transactional
    public EntrepreneurResponse createProfile(CreateEntrepreneurRequest request, String authenticatedEmail) {
        validatePublicRequest(request);

        User user = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Brugeren blev ikke fundet"));

        if (entrepreneurRepository.existsByUser_Id(user.getId())) {
            throw new IllegalArgumentException("Brugeren har allerede en fagpersonprofil");
        }

        Category category = findActiveCategory(request.getCategoryId());
        Entrepreneur entrepreneur = new Entrepreneur();
        entrepreneur.setUser(user);
        entrepreneur.setCompanyName(request.getCompanyName().trim());
        entrepreneur.setDescription(trimOrEmpty(request.getDescription()));
        entrepreneur.setPhone(trimOrEmpty(request.getPhone()));
        entrepreneur.setEmail(trimOrEmpty(request.getEmail()));
        entrepreneur.setLocation(request.getLocation().trim());
        entrepreneur.setCategory(category);
        entrepreneur.setStatus(EntrepreneurStatus.PENDING);
        entrepreneur.setActive(true);
        entrepreneur.setRating(0.0);

        return toPublicResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public List<AdminEntrepreneurResponse> getAllForAdmin(EntrepreneurStatus status) {
        List<Entrepreneur> entrepreneurs = status == null
                ? entrepreneurRepository.findAllByOrderByCreatedAtDesc()
                : entrepreneurRepository.findByStatusOrderByCreatedAtDesc(status);
        return entrepreneurs.stream().map(this::toAdminResponse).toList();
    }

    @Transactional
    public AdminEntrepreneurResponse createByAdmin(AdminCreateEntrepreneurRequest request) {
        validateAdminRequest(request);
        String loginEmail = request.getUserEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(loginEmail)) {
            throw new IllegalArgumentException("Der findes allerede en bruger med denne email");
        }

        Category category = findActiveCategory(request.getCategoryId());
        User user = new User();
        user.setName(request.getUserName().trim());
        user.setEmail(loginEmail);
        user.setPassword(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setRole(Role.ENTREPRENEUR);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        Entrepreneur entrepreneur = new Entrepreneur();
        entrepreneur.setUser(savedUser);
        entrepreneur.setCompanyName(request.getCompanyName().trim());
        entrepreneur.setDescription(trimOrEmpty(request.getDescription()));
        entrepreneur.setPhone(trimOrEmpty(request.getPhone()));
        entrepreneur.setEmail(trimOrEmpty(request.getBusinessEmail()));
        entrepreneur.setLocation(request.getLocation().trim());
        entrepreneur.setCategory(category);
        entrepreneur.setStatus(EntrepreneurStatus.APPROVED);
        entrepreneur.setActive(true);
        entrepreneur.setRating(0.0);

        return toAdminResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public AdminEntrepreneurResponse updateStatus(Long entrepreneurId, EntrepreneurStatus newStatus) {
        Entrepreneur entrepreneur = entrepreneurRepository.findById(entrepreneurId)
                .orElseThrow(() -> new IllegalArgumentException("Fagpersonen blev ikke fundet"));
        entrepreneur.setStatus(newStatus);
        User user = entrepreneur.getUser();

        if (newStatus == EntrepreneurStatus.APPROVED) {
            // En godkendt fagperson skal være aktiv,
            // så profilen bliver vist på den offentlige liste.
            entrepreneur.setActive(true);

            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ENTREPRENEUR);
            }
        }
        if (newStatus == EntrepreneurStatus.REJECTED && user.getRole() == Role.ENTREPRENEUR) {
            user.setRole(Role.USER);
        }
        userRepository.save(user);
        return toAdminResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public AdminEntrepreneurResponse deactivate(Long id) {
        Entrepreneur entrepreneur = findEntrepreneur(id);
        entrepreneur.setActive(false);
        return toAdminResponse(entrepreneurRepository.save(entrepreneur));
    }

    @Transactional
    public AdminEntrepreneurResponse restore(Long id) {
        Entrepreneur entrepreneur = findEntrepreneur(id);
        entrepreneur.setActive(true);
        return toAdminResponse(entrepreneurRepository.save(entrepreneur));
    }

    private Entrepreneur findEntrepreneur(Long id) {
        return entrepreneurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fagpersonen blev ikke fundet"));
    }

    private Category findActiveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .filter(Category::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Kategorien findes ikke eller er deaktiveret"));
    }

    private EntrepreneurResponse toPublicResponse(Entrepreneur entrepreneur) {
        return new EntrepreneurResponse(
                entrepreneur.getId(), entrepreneur.getCompanyName(), entrepreneur.getDescription(),
                entrepreneur.getPhone(), entrepreneur.getEmail(), entrepreneur.getLocation(),
                entrepreneur.getCategory().getId(), entrepreneur.getCategory().getName(),
                entrepreneur.getCategory().getIcon(), entrepreneur.getRating(), entrepreneur.isAvailableForWork());
    }

    private AdminEntrepreneurResponse toAdminResponse(Entrepreneur entrepreneur) {
        User user = entrepreneur.getUser();
        Category category = entrepreneur.getCategory();
        return new AdminEntrepreneurResponse(
                entrepreneur.getId(), user.getId(), user.getName(), user.getEmail(),
                entrepreneur.getCompanyName(), entrepreneur.getDescription(), entrepreneur.getPhone(),
                entrepreneur.getEmail(), entrepreneur.getLocation(), category.getId(), category.getName(),
                entrepreneur.getStatus(), entrepreneur.isActive(), entrepreneur.getRating(),
                entrepreneur.getCreatedAt(), entrepreneur.getUpdatedAt());
    }

    private void validatePublicRequest(CreateEntrepreneurRequest request) {
        if (request == null) throw new IllegalArgumentException("Profildata mangler");
        requireText(request.getCompanyName(), "Virksomhedsnavn skal udfyldes");
        requireText(request.getLocation(), "Område skal udfyldes");
        requireCategory(request.getCategoryId());
    }

    private void validateAdminRequest(AdminCreateEntrepreneurRequest request) {
        if (request == null) throw new IllegalArgumentException("Profildata mangler");
        requireText(request.getUserName(), "Brugerens navn skal udfyldes");
        requireText(request.getUserEmail(), "Brugerens email skal udfyldes");
        requireText(request.getCompanyName(), "Virksomhedsnavn skal udfyldes");
        requireText(request.getLocation(), "Område skal udfyldes");
        requireCategory(request.getCategoryId());
        if (isBlank(request.getTemporaryPassword()) || request.getTemporaryPassword().length() < 8) {
            throw new IllegalArgumentException("Den midlertidige adgangskode skal være mindst 8 tegn");
        }
    }

    private void requireCategory(Long categoryId) {
        if (categoryId == null) throw new IllegalArgumentException("Vælg en kategori");
    }

    private void requireText(String value, String message) {
        if (isBlank(value)) throw new IllegalArgumentException(message);
    }

    private String trimOrEmpty(String value) { return value == null ? "" : value.trim(); }
    private boolean isBlank(String value) { return value == null || value.trim().isEmpty(); }
}

