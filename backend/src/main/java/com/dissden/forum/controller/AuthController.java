package com.dissden.forum.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dissden.forum.model.User;
import com.dissden.forum.payload.request.LoginRequest;
import com.dissden.forum.payload.request.SignupRequest;
import com.dissden.forum.payload.request.ForgotPasswordRequest;
import com.dissden.forum.payload.request.ResetPasswordRequest;
import com.dissden.forum.payload.response.JwtResponse;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.jwt.JwtUtils;
import com.dissden.forum.security.services.UserDetailsImpl;
import com.dissden.forum.service.EmailService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import java.time.temporal.ChronoUnit;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 userDetails.getId(),
                                                 userDetails.getUsername(),
                                                 userDetails.getEmail()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        var userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !userOpt.get().getEmail().equalsIgnoreCase(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid username or email."));
        }
        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);
        String resetLink = "http://localhost:5173/reset-password?token=" + token; // Adjust frontend URL as needed
        String emailText = "You requested a password reset. Use the following token: " + token + " or click the link: " + resetLink;
        emailService.sendEmail(user.getEmail(), "Password Reset Request", emailText);
        return ResponseEntity.ok(new MessageResponse("Password reset instructions sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        var userOpt = userRepository.findByResetToken(request.getToken());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired token."));
        }
        User user = userOpt.get();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token has expired."));
        }
        String password = request.getNewPassword();
        if (!password.matches("^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Password must be at least 8 characters, contain at least one digit and one special character."));
        }
        user.setPassword(encoder.encode(password));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password reset successful. You can now log in."));
    }
}
