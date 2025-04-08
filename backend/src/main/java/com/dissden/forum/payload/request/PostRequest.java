
package com.dissden.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class PostRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String title;
    
    @NotBlank
    @Size(min = 5, max = 5000)
    private String content;
    
    @NotNull
    private Long denId;
    
    private List<String> imageUrls;
}
