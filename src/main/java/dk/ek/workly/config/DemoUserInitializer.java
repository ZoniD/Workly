package dk.ek.workly.config;

import dk.ek.workly.model.Category;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.CategoryRepository;
import dk.ek.workly.repository.EntrepreneurRepository;
import dk.ek.workly.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(
        name = "workly.demo-users.enabled",
        havingValue = "true"
)
public class DemoUserInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL =
            "admin@gmail.com";

    private static final String ENTREPRENEUR_EMAIL =
            "bruger@gmail.com";

    private static final String DEMO_PASSWORD =
            "12345678";

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EntrepreneurRepository entrepreneurRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            EntrepreneurRepository entrepreneurRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.entrepreneurRepository = entrepreneurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        createOrUpdateAdmin();

        createOrUpdateEntrepreneur();
    }

    private void createOrUpdateAdmin() {

        User admin = userRepository
                .findByEmailIgnoreCase(ADMIN_EMAIL)
                .orElseGet(User::new);

        admin.setName("Workly Admin");
        admin.setEmail(ADMIN_EMAIL);

        /*
         * Passwordet hashes med BCrypt.
         *
         * Det nulstilles til 12345678 ved hver opstart,
         * så dette bør kun bruges under udvikling.
         */
        admin.setPassword(
                passwordEncoder.encode(DEMO_PASSWORD)
        );

        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
    }

    private void createOrUpdateEntrepreneur() {

        User user = userRepository
                .findByEmailIgnoreCase(ENTREPRENEUR_EMAIL)
                .orElseGet(User::new);

        user.setName("Workly Fagperson");
        user.setEmail(ENTREPRENEUR_EMAIL);

        user.setPassword(
                passwordEncoder.encode(DEMO_PASSWORD)
        );

        user.setRole(Role.ENTREPRENEUR);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        Category category = findOrCreateCategory();

        Entrepreneur entrepreneur =
                entrepreneurRepository
                        .findByUser_Id(savedUser.getId())
                        .orElseGet(Entrepreneur::new);

        entrepreneur.setUser(savedUser);
        entrepreneur.setCompanyName("Workly Håndværk");
        entrepreneur.setDescription(
                "Erfaren fagperson, som hjælper med både små og store opgaver."
        );
        entrepreneur.setPhone("12 34 56 78");
        entrepreneur.setEmail(ENTREPRENEUR_EMAIL);
        entrepreneur.setLocation("København");
        entrepreneur.setCategory(category);

        /*
         * Profilen er allerede godkendt,
         * så den kan bruge fagpersonportalen.
         */
        entrepreneur.setStatus(
                EntrepreneurStatus.APPROVED
        );

        /*
         * Profilen må vises på Workly.
         */
        entrepreneur.setActive(true);

        /*
         * Fagpersonen tager imod opgaver.
         */
        entrepreneur.setAvailableForWork(true);

        /*
         * Startbedømmelse.
         */
        if (entrepreneur.getId() == null) {
            entrepreneur.setRating(0.0);
        }

        entrepreneurRepository.save(entrepreneur);
    }

    private Category findOrCreateCategory() {

        return categoryRepository
                .findByNameIgnoreCase("Elektriker")
                .orElseGet(() -> {

                    Category category = new Category();

                    category.setName("Elektriker");
                    category.setDescription(
                            "Hjælp til installationer, elarbejde og fejlfinding."
                    );
                    category.setIcon("⚡");
                    category.setActive(true);

                    return categoryRepository.save(category);
                });
    }
}