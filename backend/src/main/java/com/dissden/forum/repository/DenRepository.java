
package com.dissden.forum.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dissden.forum.model.Den;

public interface DenRepository extends JpaRepository<Den, Long> {
    Optional<Den> findByTitle(String title);
    boolean existsByTitle(String title);
}
