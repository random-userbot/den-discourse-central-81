
package com.dissden.forum.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.dissden.forum.model.Comment;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;
import com.dissden.forum.payload.response.CommentResponse;
import com.dissden.forum.payload.response.PostResponse;
import com.dissden.forum.payload.response.UserProfileResponse;
import com.dissden.forum.repository.CommentRepository;
import com.dissden.forum.repository.PostRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.services.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileResponse profileResponse = new UserProfileResponse();
        profileResponse.setId(user.getId());
        profileResponse.setUsername(user.getUsername());
        profileResponse.setAvatarUrl(user.getAvatarUrl());
        profileResponse.setCreatedAt(user.getCreatedAt());
        
        return ResponseEntity.ok(profileResponse);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        return getUserProfile(userDetails.getId());
    }
    
    @GetMapping("/{id}/history")
    public ResponseEntity<Map<String, Object>> getUserHistory(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Post> userPosts = postRepository.findByUserOrderByCreatedAtDesc(user);
        List<PostResponse> postResponses = userPosts.stream()
                .map(post -> {
                    PostResponse response = new PostResponse();
                    response.setId(post.getId());
                    response.setTitle(post.getTitle());
                    response.setContent(post.getContent());
                    response.setDenId(post.getDen().getId());
                    response.setDenTitle(post.getDen().getTitle());
                    response.setCreatedAt(post.getCreatedAt());
                    response.setVoteCount(post.getVoteCount());
                    return response;
                })
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
                    response.setCreatedAt(comment.getCreatedAt());
                    response.setVoteCount(comment.getVoteCount());
                    return response;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> history = new HashMap<>();
        history.put("posts", postResponses);
        history.put("comments", commentResponses);
        
        return ResponseEntity.ok(history);
    }
}
