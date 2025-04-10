
package com.dissden.forum.payload.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserProfileResponse {
    private Long id;
    private String username;
    private String avatarUrl;
    private String bio;
    private LocalDateTime createdAt;
}
