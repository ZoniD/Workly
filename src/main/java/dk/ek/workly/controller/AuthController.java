package dk.ek.workly.controller;

import dk.ek.workly.dto.LoginRequest;
import dk.ek.workly.dto.LoginResponse;
import dk.ek.workly.model.User;
import dk.ek.workly.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins =  "http://127.0.0.1:5500")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }


    //Here the user kan register themselves into the system
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);


    }

    //Login logic
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail());

        if (user == null) {
            return new LoginResponse("User not found", null);
        }

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return new LoginResponse("Incorrect password", null);
        }
        return new LoginResponse("login was Success",user.getRole().name());
    }
}

