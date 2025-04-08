
package com.dissden.forum.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DenRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String title;
    
    @Size(max = 500)
    private String description;
    
    private String imageUrl;
}
