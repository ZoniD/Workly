package dk.ek.workly.service;

import dk.ek.workly.dto.LoginRequest;
import dk.ek.workly.dto.LoginResponse;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationService(UserService userService,
                                 PasswordEncoder passwordEncoder,
                                 JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Register new user with default VISITOR role
     */
    public LoginResponse register(User user) {
        // Input validation
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return new LoginResponse("Email is required", null, null);
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            return new LoginResponse("Password must be at least 6 characters", null, null);
        }
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            return new LoginResponse("Name is required", null, null);
        }

        // Check if email already exists
        if (userService.findByEmail(user.getEmail()) != null) {
            return new LoginResponse("Email already registered", null, null);
        }

        user.setRole(Role.VISITOR);
        User registeredUser = userService.registerUser(user);

        // Generate JWT token for authentication
        @SuppressWarnings("unused")
        String token = jwtTokenProvider.generateToken(registeredUser.getEmail(), registeredUser.getRole().name());

        return new LoginResponse("Registration successful", registeredUser.getEmail(), registeredUser.getName());
    }

    /**
     * Authenticate user and return JWT token
     */
    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return new LoginResponse("Email is required", null, null);
        }

        User user = userService.findByEmail(request.getEmail());

        if (user == null) {
            return new LoginResponse("User not found", null, null);
        }

        if (!user.isEnabled()) {
            return new LoginResponse("Account is disabled", null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse("Incorrect password", null, null);
        }

        // Generate JWT token for authentication
        @SuppressWarnings("unused")
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse("Login successful", user.getEmail(), user.getName());
    }

    /**
     * Generate JWT token for an email
     * Used to create tokens during login/register
     */
    public String generateToken(String email) {
        User user = userService.findByEmail(email);
        if (user != null) {
            return jwtTokenProvider.generateToken(email, user.getRole().name());
        }
        return null;
    }
}
