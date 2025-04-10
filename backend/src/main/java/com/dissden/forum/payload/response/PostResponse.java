
package com.dissden.forum.payload.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long userId;
    private String username;
    private Long denId;
    private String denTitle;
    private LocalDateTime createdAt;
    private Integer voteCount;
    private Integer commentCount;
    private Long denCreatorId;
    private List<String> imageUrls;
}
