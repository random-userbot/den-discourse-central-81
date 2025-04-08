
package com.dissden.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank
    @Size(min = 1, max = 1000)
    private String content;
    
    @NotNull
    private Long postId;
    
    private Long parentCommentId;
}
