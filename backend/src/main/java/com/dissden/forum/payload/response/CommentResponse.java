
package com.dissden.forum.payload.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private Long userId;
    private String username;
    private Long postId;
    private String postTitle;
    private Long denId;
    private String denTitle;
    private Long parentCommentId;
    private LocalDateTime createdAt;
    private Integer voteCount;
    private Integer upvotes;
    private Integer downvotes;
    private Integer replyCount;
    private boolean hasReplies;
}
