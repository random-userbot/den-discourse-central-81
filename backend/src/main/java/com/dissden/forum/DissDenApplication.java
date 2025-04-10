
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
    
    @Bean
    CommandLineRunner init(UserRepository userRepository, DenRepository denRepository, 
                          PostRepository postRepository, PasswordEncoder encoder) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                // Create admin user
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123"));
                admin.setEmail("admin@dissden.com");
                admin.setCreatedAt(LocalDateTime.now());
                admin = userRepository.save(admin);
                
                // Create general den
                Den generalDen = new Den();
                generalDen.setTitle("general");
                generalDen.setDescription("A place to talk about anything!");
                generalDen.setCreator(admin);
                generalDen.setCreatedAt(LocalDateTime.now());
                generalDen = denRepository.save(generalDen);
                
                // Create welcome post
                Post welcomePost = new Post();
                welcomePost.setTitle("Welcome to DissDen!");
                welcomePost.setContent("Welcome to DissDen, a forum where you can discuss anything and everything!\n\nHere's what you can do on DissDen:\n\n- Create and join dens (our name for communities)\n- Post text and images\n- Comment on posts\n- Upvote or downvote posts and comments\n- Customize your profile\n\nFeel free to explore the site and join the conversations. If you have any questions, just ask in this thread!\n\nEnjoy your stay at DissDen!");
                welcomePost.setUser(admin);
                welcomePost.setDen(generalDen);
                welcomePost.setCreatedAt(LocalDateTime.now());
                welcomePost.setImageUrls(new ArrayList<>());
                postRepository.save(welcomePost);
                
                System.out.println("Initialized database with admin user and general den");
            }
        };
    }
}
