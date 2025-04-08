
package com.dissden.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dissden.forum.model.PostImage;
import com.dissden.forum.model.Post;
import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    List<PostImage> findByPost(Post post);
}
