
package com.dissden.forum.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.dissden.forum.model.Comment;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;
import com.dissden.forum.payload.request.CommentRequest;
import com.dissden.forum.payload.request.VoteRequest;
import com.dissden.forum.payload.response.CommentResponse;
import com.dissden.forum.payload.response.MessageResponse;
import com.dissden.forum.repository.CommentRepository;
import com.dissden.forum.repository.PostRepository;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.security.services.UserDetailsImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        List<Comment> comments = commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtDesc(post);
        
        List<CommentResponse> commentResponses = comments.stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(commentResponses);
    }
    
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentResponse>> getRepliesForComment(@PathVariable Long commentId) {
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        List<Comment> replies = commentRepository.findByParentCommentOrderByCreatedAtDesc(parentComment);
        
        List<CommentResponse> replyResponses = replies.stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(replyResponses);
    }
    
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentRequest commentRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(commentRequest.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setUser(user);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());
        
        // Set parent comment if this is a reply
        if (commentRequest.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(commentRequest.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
            
            // Increment reply count on parent comment
            parentComment.setReplyCount(parentComment.getReplyCount() + 1);
            commentRepository.save(parentComment);
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        CommentResponse commentResponse = mapCommentToResponse(savedComment);
        
        return new ResponseEntity<>(commentResponse, HttpStatus.CREATED);
    }
    
    @PostMapping("/{id}/vote")
    public ResponseEntity<CommentResponse> voteComment(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest voteRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update votes directly on comment
        if (voteRequest.isUpvote()) {
            comment.setUpvotes(comment.getUpvotes() + 1);
        } else {
            comment.setDownvotes(comment.getDownvotes() + 1);
        }
        
        Comment updatedComment = commentRepository.save(comment);
        
        CommentResponse commentResponse = mapCommentToResponse(updatedComment);
        
        return ResponseEntity.ok(commentResponse);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the comment owner or den creator
        if (comment.getUser().getId().equals(user.getId()) || 
            comment.getPost().getDen().getCreator().getId().equals(user.getId())) {
            
            // If this comment has a parent, decrement parent's reply count
            if (comment.getParentComment() != null) {
                Comment parentComment = comment.getParentComment();
                parentComment.setReplyCount(Math.max(0, parentComment.getReplyCount() - 1));
                commentRepository.save(parentComment);
            }
            
            commentRepository.delete(comment);
            return ResponseEntity.ok(new MessageResponse("Comment deleted successfully!"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error: You are not authorized to delete this comment!"));
        }
    }
    
    private CommentResponse mapCommentToResponse(Comment comment) {
        CommentResponse commentResponse = new CommentResponse();
        commentResponse.setId(comment.getId());
        commentResponse.setContent(comment.getContent());
        commentResponse.setUserId(comment.getUser().getId());
        commentResponse.setUsername(comment.getUser().getUsername());
        commentResponse.setPostId(comment.getPost().getId());
        commentResponse.setCreatedAt(comment.getCreatedAt());
        commentResponse.setVoteCount(comment.getVoteCount());
        commentResponse.setReplyCount(comment.getReplyCount());
        
        if (comment.getParentComment() != null) {
            commentResponse.setParentCommentId(comment.getParentComment().getId());
        }
        
        // Set hasReplies flag
        if (comment.getReplyCount() > 0) {
            commentResponse.setHasReplies(true);
        }
        
        return commentResponse;
    }
}
