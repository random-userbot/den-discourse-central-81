
package com.dissden.forum.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dissden.forum.model.Den;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByDenOrderByCreatedAtDesc(Den den);
    List<Post> findByUserOrderByCreatedAtDesc(User user);
}
