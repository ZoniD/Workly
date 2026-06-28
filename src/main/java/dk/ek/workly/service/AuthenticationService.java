package dk.ek.workly.service;

import dk.ek.workly.dto.AuthResponse;
import dk.ek.workly.dto.LoginRequest;
import dk.ek.workly.dto.RegisterRequest;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.UserRepository;
import dk.ek.workly.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        validateRegistration(request);

        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Emailen er allerede registreret");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        return createResponse("Din bruger er oprettet", savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new BadCredentialsException("Email og adgangskode skal udfyldes");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new BadCredentialsException("Forkert email eller adgangskode"));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Brugeren er deaktiveret");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Forkert email eller adgangskode");
        }

        return createResponse("Du er nu logget ind", user);
    }

    private AuthResponse createResponse(String message, User user) {
        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                message,
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private void validateRegistration(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registreringsdata mangler");
        }
        if (isBlank(request.getName())) {
            throw new IllegalArgumentException("Navn skal udfyldes");
        }
        if (isBlank(request.getEmail()) || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Indtast en gyldig email");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Adgangskoden skal være mindst 8 tegn");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
