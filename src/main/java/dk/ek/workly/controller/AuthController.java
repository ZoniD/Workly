package dk.ek.workly.controller;

import dk.ek.workly.dto.LoginRequest;
import dk.ek.workly.dto.LoginResponse;
import dk.ek.workly.model.User;
import dk.ek.workly.service.AuthenticationService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authService;

    public AuthController(AuthenticationService authService) {
        this.authService = authService;
    }

    /**
     * Register new user as VISITOR
     * JWT token sent in Authorization header
     * Returns: 201 Created on success, 400 Bad Request on failure
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @RequestBody User user,
            HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.register(user);
            String token = authService.generateToken(user.getEmail());
            if (token != null) {
                response.setHeader("Authorization", "Bearer " + token);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse("Registration failed: " + e.getMessage(), null, null));
        }
    }

    /**
     * Login user with email and password
     * JWT token sent in Authorization header
     * Returns: 200 OK on success, 401 Unauthorized on failure
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);

        // Check if login was successful (email field indicates success)
        if (loginResponse.getEmail() != null) {
            String token = authService.generateToken(loginResponse.getEmail());
            if (token != null) {
                response.setHeader("Authorization", "Bearer " + token);
            }
            return ResponseEntity.ok(loginResponse);
        }

        // Login failed - return 401 Unauthorized
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(loginResponse);
    }
}
