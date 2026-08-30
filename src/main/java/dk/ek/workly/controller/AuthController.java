package dk.ek.workly.controller;
import dk.ek.workly.dto.ApprovalRequest;
import dk.ek.workly.dto.AuthResponse;
import dk.ek.workly.dto.userDTO.LoginRequest;
import dk.ek.workly.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    public AuthController(AuthenticationService authenticationService){this.authenticationService=authenticationService;}
    @PostMapping("/register") public ResponseEntity<?> register(@Valid @RequestBody ApprovalRequest.RegisterRequest request){try{AuthResponse response=authenticationService.register(request);return ResponseEntity.status(HttpStatus.CREATED).body(response);}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody LoginRequest request){try{return ResponseEntity.ok(authenticationService.login(request));}catch(IllegalArgumentException e){return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message",e.getMessage()));}}
}
