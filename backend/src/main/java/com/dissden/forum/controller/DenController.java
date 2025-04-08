
package com.dissden.forum.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.dissden.forum.model.Den;
import com.dissden.forum.model.User;
import com.dissden.forum.payload.request.DenRequest;
import com.dissden.forum.payload.response.DenResponse;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.repository.DenRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.services.UserDetailsImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dens")
@RequiredArgsConstructor
public class DenController {
    
    private final DenRepository denRepository;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<Den>> getAllDens() {
        List<Den> dens = denRepository.findAll();
        return ResponseEntity.ok(dens);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Den> getDenById(@PathVariable Long id) {
        return denRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createDen(
            @Valid @RequestBody DenRequest denRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (denRepository.existsByTitle(denRequest.getTitle())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Den title is already taken!"));
        }
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Den den = new Den();
        den.setTitle(denRequest.getTitle());
        den.setDescription(denRequest.getDescription());
        den.setImageUrl(denRequest.getImageUrl());
        den.setCreator(user);
        den.setCreatedAt(LocalDateTime.now());
        
        Den savedDen = denRepository.save(den);
        
        DenResponse response = new DenResponse();
        response.setId(savedDen.getId());
        response.setTitle(savedDen.getTitle());
        response.setDescription(savedDen.getDescription());
        response.setImageUrl(savedDen.getImageUrl());
        response.setCreatorId(savedDen.getCreator().getId());
        response.setCreatorUsername(savedDen.getCreator().getUsername());
        response.setCreatedAt(savedDen.getCreatedAt());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
