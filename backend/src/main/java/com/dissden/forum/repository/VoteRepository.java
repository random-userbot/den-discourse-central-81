
package com.dissden.forum.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dissden.forum.model.Comment;
import com.dissden.forum.model.Post;
import com.dissden.forum.model.User;
import com.dissden.forum.model.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndPost(User user, Post post);
    Optional<Vote> findByUserAndComment(User user, Comment comment);
}
