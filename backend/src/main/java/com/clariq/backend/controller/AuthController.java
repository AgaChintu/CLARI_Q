
package com.clariq.backend.controller;

import com.clariq.backend.dto.LoginRequest;
import com.clariq.backend.dto.LoginResponse;
import com.clariq.backend.entity.User;
import com.clariq.backend.entity.UserRole;
import com.clariq.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        UserRole role;

        try {
            role = UserRole.valueOf(
                    request.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        User user = userRepository
                .findByLoginIdAndRole(request.getLoginId(), role)
                .orElse(null);

        if (user == null || !user.isActive()
                || !passwordEncoder.matches(
                        request.getPassword(), user.getPasswordHash())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid login ID or password");
        }

        // Prevent session fixation
        HttpSession oldSession = httpRequest.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        // Create a new authenticated session
        HttpSession session = httpRequest.getSession(true);

        session.setAttribute("userId", user.getId().toString());
        session.setAttribute("role", user.getRole().name());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getLoginId(),
                user.getRole().name(),
                "Login successful");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        return ResponseEntity.ok(
                java.util.Map.of(
                        "userId", session.getAttribute("userId"),
                        "role", session.getAttribute("role")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok("Logged out successfully");
    }
}
