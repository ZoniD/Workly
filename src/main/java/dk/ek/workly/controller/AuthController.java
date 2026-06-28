package dk.ek.workly.controller;

import dk.ek.workly.dto.AuthResponse;
import dk.ek.workly.dto.LoginRequest;
import dk.ek.workly.dto.RegisterRequest;
import dk.ek.workly.service.AuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(authenticationService.register(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(error(exception.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.login(request));
        } catch (BadCredentialsException exception) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error(exception.getMessage()));
        }
    }

    private AuthResponse error(String message) {
        return new AuthResponse(message, null, null, null, null);
    }
}
