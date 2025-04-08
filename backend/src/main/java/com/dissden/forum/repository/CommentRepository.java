
package com.dissden.forum.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dissden.forum.model.Comment;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtDesc(Post post);
    List<Comment> findByParentCommentOrderByCreatedAtDesc(Comment parentComment);
    List<Comment> findByUserOrderByCreatedAtDesc(User user);
}
