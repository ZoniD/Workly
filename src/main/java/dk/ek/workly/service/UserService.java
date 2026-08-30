package dk.ek.workly.service;

import dk.ek.workly.dto.userDTO.UserResponse;
import dk.ek.workly.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) { this.userRepository = userRepository; }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isEnabled()))
                .toList();
    }
}
