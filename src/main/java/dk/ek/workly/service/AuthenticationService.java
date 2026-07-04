package dk.ek.workly.service;

import dk.ek.workly.dto.ApprovalRequest;
import dk.ek.workly.dto.AuthResponse;
import dk.ek.workly.dto.userDTO.LoginRequest;
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
    private final JwtTokenProvider jwtokenProvider;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtokenProvider = jwtokenProvider;
    }

    public AuthResponse register(ApprovalRequest.RegisterRequest request) {
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

        User user = userRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Forkert email eller adgangskode"
                        )
                );

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "Brugerkontoen er deaktiveret"
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "Forkert email eller adgangskode"
            );
        }

        String token = jwtokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                "Login gennemført",
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private AuthResponse createResponse(String message, User user) {
        String token = jwtokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                message,
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private void validateRegistration(ApprovalRequest.RegisterRequest request) {
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
