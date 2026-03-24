package com.riskanalysis.risk_system.controller;

import com.riskanalysis.risk_system.model.User;
import com.riskanalysis.risk_system.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

            if (existingUser.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email already registered");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            User savedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("name", savedUser.getName());
            response.put("email", savedUser.getEmail());
            response.put("role", savedUser.getRole());
            response.put("message", "Registration Successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

            if (existingUser.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User dbUser = existingUser.get();

            if (dbUser.getPassword() == null || user.getPassword() == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (!dbUser.getPassword().equals(user.getPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid Password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", dbUser.getId());
            response.put("name", dbUser.getName());
            response.put("email", dbUser.getEmail());
            response.put("role", dbUser.getRole());
            response.put("message", "Login Successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}