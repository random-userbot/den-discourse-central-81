
package com.dissden.forum.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dissden.forum.model.Den;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;
import com.dissden.forum.payload.request.PostRequest;
import com.dissden.forum.payload.request.VoteRequest;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.payload.response.PostResponse;
import com.dissden.forum.repository.DenRepository;
import com.dissden.forum.repository.PostRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.services.UserDetailsImpl;
import com.dissden.forum.service.FileStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    
    private final PostRepository postRepository;
    private final DenRepository denRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        
        List<PostResponse> postResponses = posts.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @GetMapping("/den/{denId}")
    public ResponseEntity<List<PostResponse>> getPostsByDen(@PathVariable Long denId) {
        Den den = denRepository.findById(denId)
                .orElseThrow(() -> new RuntimeException("Den not found"));
        
        List<Post> posts = postRepository.findByDenOrderByCreatedAtDesc(den);
        
        List<PostResponse> postResponses = posts.stream()
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        PostResponse postResponse = mapPostToResponse(post);
        
        return ResponseEntity.ok(postResponse);
    }
    
    @PostMapping
    public ResponseEntity<?> createPost(
            @Valid @RequestBody PostRequest postRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Den den = denRepository.findById(postRequest.getDenId())
                .orElseThrow(() -> new RuntimeException("Den not found"));
        
        Post post = new Post();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setUser(user);
        post.setDen(den);
        post.setCreatedAt(LocalDateTime.now());
        
        // Handle images directly in the post
        if (postRequest.getImageUrls() != null && !postRequest.getImageUrls().isEmpty()) {
            post.setImageUrls(postRequest.getImageUrls());
        }
        
        Post savedPost = postRepository.save(post);
        
        PostResponse postResponse = mapPostToResponse(savedPost);
        
        return new ResponseEntity<>(postResponse, HttpStatus.CREATED);
    }
    
    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String imageUrl = fileStorageService.storeFile(file);
            imageUrls.add(imageUrl);
        }
        
        return ResponseEntity.ok(imageUrls);
    }
    
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> votePost(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest voteRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update votes directly on post
        if (voteRequest.isUpvote()) {
            post.setUpvotes(post.getUpvotes() + 1);
        } else {
            post.setDownvotes(post.getDownvotes() + 1);
        }
        
        Post updatedPost = postRepository.save(post);
        
        PostResponse postResponse = mapPostToResponse(updatedPost);
        
        return ResponseEntity.ok(postResponse);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the post owner or den creator
        if (post.getUser().getId().equals(user.getId()) || 
            post.getDen().getCreator().getId().equals(user.getId())) {
            
            postRepository.delete(post);
            return ResponseEntity.ok(new MessageResponse("Post deleted successfully!"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error: You are not authorized to delete this post!"));
        }
    }
    
    private PostResponse mapPostToResponse(Post post) {
        PostResponse postResponse = new PostResponse();
        postResponse.setId(post.getId());
        postResponse.setTitle(post.getTitle());
        postResponse.setContent(post.getContent());
        postResponse.setUserId(post.getUser().getId());
        postResponse.setUsername(post.getUser().getUsername());
        postResponse.setDenId(post.getDen().getId());
        postResponse.setDenTitle(post.getDen().getTitle());
        postResponse.setCreatedAt(post.getCreatedAt());
        postResponse.setVoteCount(post.getVoteCount());
        postResponse.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);
        
        // Set den creator ID for permission checks
        postResponse.setDenCreatorId(post.getDen().getCreator().getId());
        
        // Map images directly from post
        if (post.getImageUrls() != null && !post.getImageUrls().isEmpty()) {
            postResponse.setImageUrls(post.getImageUrls());
        }
        
        return postResponse;
    }
}
