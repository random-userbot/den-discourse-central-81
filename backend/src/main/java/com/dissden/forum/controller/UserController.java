package com.dissden.forum.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dissden.forum.model.Comment;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;
import com.dissden.forum.payload.request.UpdateProfileRequest;
import com.dissden.forum.payload.response.CommentResponse;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.payload.response.PostResponse;
import com.dissden.forum.payload.response.UserProfileResponse;
import com.dissden.forum.repository.CommentRepository;
import com.dissden.forum.repository.PostRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.services.UserDetailsImpl;
import com.dissden.forum.service.FileStorageService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final FileStorageService fileStorageService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileResponse profileResponse = new UserProfileResponse();
        profileResponse.setId(user.getId());
        profileResponse.setUsername(user.getUsername());
        profileResponse.setAvatarUrl(user.getAvatarUrl());
        profileResponse.setCreatedAt(user.getCreatedAt());
        profileResponse.setBio(user.getBio());
        
        return ResponseEntity.ok(profileResponse);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        return getUserProfile(userDetails.getId());
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest updateProfileRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update bio if provided
        if (updateProfileRequest.getBio() != null) {
            user.setBio(updateProfileRequest.getBio());
        }
        
        // Update avatar URL if provided
        if (updateProfileRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateProfileRequest.getAvatarUrl());
        }
        
        User updatedUser = userRepository.save(user);
        
        UserProfileResponse profileResponse = new UserProfileResponse();
        profileResponse.setId(updatedUser.getId());
        profileResponse.setUsername(updatedUser.getUsername());
        profileResponse.setAvatarUrl(updatedUser.getAvatarUrl());
        profileResponse.setCreatedAt(updatedUser.getCreatedAt());
        profileResponse.setBio(updatedUser.getBio());
        
        return ResponseEntity.ok(profileResponse);
    }
    
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String avatarUrl = fileStorageService.storeFile(file);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", avatarUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Could not upload avatar: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/history")
    public ResponseEntity<Map<String, Object>> getUserHistory(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Post> userPosts = postRepository.findByUserOrderByCreatedAtDesc(user);
        List<PostResponse> postResponses = userPosts.stream()
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
        
        List<Comment> userComments = commentRepository.findByUserOrderByCreatedAtDesc(user);
        List<CommentResponse> commentResponses = userComments.stream()
                .map(comment -> {
                    CommentResponse response = new CommentResponse();
                    response.setId(comment.getId());
                    response.setContent(comment.getContent());
                    response.setPostId(comment.getPost().getId());
                    response.setPostTitle(comment.getPost().getTitle());
                    response.setDenId(comment.getPost().getDen().getId());
                    response.setDenTitle(comment.getPost().getDen().getTitle());
                    response.setUserId(comment.getUser().getId());
                    response.setUsername(comment.getUser().getUsername());
                    response.setCreatedAt(comment.getCreatedAt());
                    response.setVoteCount(comment.getVoteCount());
                    
                    if (comment.getParentComment() != null) {
                        response.setParentCommentId(comment.getParentComment().getId());
                    }
                    
                    if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                        response.setHasReplies(true);
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> history = new HashMap<>();
        history.put("posts", postResponses);
        history.put("comments", commentResponses);
        
        return ResponseEntity.ok(history);
    }
    
    private PostResponse mapPostToResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setUserId(post.getUser().getId());
        response.setUsername(post.getUser().getUsername());
        response.setDenId(post.getDen().getId());
        response.setDenTitle(post.getDen().getTitle());
        response.setCreatedAt(post.getCreatedAt());
        response.setVoteCount(post.getVoteCount());
        response.setCommentCount(post.getComments().size());
        response.setDenCreatorId(post.getDen().getCreator().getId());
        
        if (post.getImageUrls() != null && !post.getImageUrls().isEmpty()) {
            List<String> imageUrls = post.getImageUrls();

            response.setImageUrls(imageUrls);
        }
        
        return response;
    }
}
