
package com.dissden.forum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.dissden.forum.model.User;
import com.dissden.forum.model.Den;
import com.dissden.forum.model.Post;
import com.dissden.forum.repository.UserRepository;
import com.dissden.forum.repository.DenRepository;
import com.dissden.forum.repository.PostRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;

@SpringBootApplication
public class DissDenApplication {

    public static void main(String[] args) {
        SpringApplication.run(DissDenApplication.class, args);
    }
    
}
   