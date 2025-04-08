
package com.dissden.forum.payload.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DenResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Long creatorId;
    private String creatorUsername;
    private LocalDateTime createdAt;
}
