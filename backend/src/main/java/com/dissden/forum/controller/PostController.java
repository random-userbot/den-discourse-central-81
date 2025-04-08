
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
import com.dissden.forum.model.PostImage;
import com.dissden.forum.model.User;
import com.dissden.forum.model.Vote;
import com.dissden.forum.payload.request.PostRequest;
import com.dissden.forum.payload.request.VoteRequest;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.payload.response.PostResponse;
import com.dissden.forum.repository.DenRepository;
import com.dissden.forum.repository.PostImageRepository;
import com.dissden.forum.repository.PostRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.repository.VoteRepository;
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
    private final VoteRepository voteRepository;
    private final PostImageRepository postImageRepository;
    private final FileStorageService fileStorageService;
    
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
        
        Post savedPost = postRepository.save(post);
        
        // Handle image URLs (if provided in request)
        if (postRequest.getImageUrls() != null && !postRequest.getImageUrls().isEmpty()) {
            for (String imageUrl : postRequest.getImageUrls()) {
                PostImage image = new PostImage();
                image.setImageUrl(imageUrl);
                image.setPost(savedPost);
                postImageRepository.save(image);
            }
        }
        
        PostResponse postResponse = mapPostToResponse(savedPost);
        
        return new ResponseEntity<>(postResponse, HttpStatus.CREATED);
    }
    
    @PostMapping("/{id}/upload-images")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error: You are not authorized to upload images to this post!"));
        }
        
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String imageUrl = fileStorageService.storeFile(file);
            
            PostImage image = new PostImage();
            image.setImageUrl(imageUrl);
            image.setPost(post);
            postImageRepository.save(image);
            
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
        
        Vote vote = voteRepository.findByUserAndPost(user, post)
                .orElse(new Vote());
        
        vote.setUser(user);
        vote.setPost(post);
        vote.setUpvote(voteRequest.isUpvote());
        
        voteRepository.save(vote);
        
        // Re-fetch the post to get the updated vote count
        post = postRepository.findById(id).get();
        
        PostResponse postResponse = mapPostToResponse(post);
        
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
        
        // Map all images
        if (post.getImages() != null) {
            postResponse.setImageUrls(post.getImages().stream()
                    .map(PostImage::getImageUrl)
                    .collect(Collectors.toList()));
        }
        
        return postResponse;
    }
}
