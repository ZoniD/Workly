/*package dk.ek.workly.config;

import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.name:Workly Admin}")
    private String adminName;

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${admin.password:}")
    private String adminPassword;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) return;
        String normalizedEmail = adminEmail.trim().toLowerCase();
        User admin = userRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(User::new);
        admin.setName(adminName);
        admin.setEmail(normalizedEmail);
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        if (admin.getId() == null) admin.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
    }
}
*/
