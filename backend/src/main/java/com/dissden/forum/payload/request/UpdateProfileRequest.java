
package com.dissden.forum.payload.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String bio;
    private String avatarUrl;
    private Integer commentCount;
    private Long denCreatorId;
}
