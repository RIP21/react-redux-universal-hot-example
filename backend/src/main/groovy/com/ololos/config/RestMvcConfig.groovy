package com.ololos.config

import com.ololos.dao.PostRepository
import com.ololos.domain.Author
import com.ololos.domain.Post
import com.ololos.domain.User
import com.ololos.service.PostService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.rest.core.annotation.HandleAfterSave
import org.springframework.data.rest.core.annotation.HandleBeforeCreate
import org.springframework.data.rest.core.annotation.RepositoryEventHandler
import org.springframework.data.rest.core.config.RepositoryRestConfiguration
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurerAdapter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

@Configuration
class RestMvcConfig extends RepositoryRestConfigurerAdapter {

    void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        config.exposeIdsFor(Post.class)
        config.exposeIdsFor(Author.class)
        config.exposeIdsFor(User.class)
//        config.setBasePath("/api");
        config.setReturnBodyForPutAndPost(true)
    }

    @Bean
    PostEventHandler postEventHandler() {
        return new PostEventHandler()
    }

    @Bean
    CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource()
        CorsConfiguration config = new CorsConfiguration()
        config.setAllowCredentials(true)// you USUALLY want this
        config.addAllowedOrigin("http://localhost:3000") // production frontend
        config.addAllowedOrigin("http://localhost:3001") // watch frontend
        config.addAllowedOrigin("http://ololos.space:3000") // port direct frontend
        config.addAllowedOrigin("http://ololos.space")
        config.addAllowedHeader("*")
        config.addAllowedMethod("GET")
        config.addAllowedMethod("PUT")
        config.addAllowedMethod("POST")
        config.addAllowedMethod("DELETE")
        source.registerCorsConfiguration("/**", config)
        return new CorsFilter(source)
    }
}

@RepositoryEventHandler
class PostEventHandler {

    @Autowired
    PostService postService
    @Autowired
    private PostRepository postRepository

    @HandleBeforeCreate
    void handlePostCreate(Post post) {
        if(post.getTitle().equals("")) {
            throw new RuntimeException("Unable to save post with empty title")
        }
        post.setId(postService.generateIdFromTheTitle(post.getTitle()))
        if (postRepository.findOne(post.getId()) == null) {
            post.setPostdate(new Date())
        } else throw new DuplicateKeyException("Unable to save post. Title duplication detected, please change it")
    }

    @HandleAfterSave
    void handlePostDeleted(Post post) {
        if (isDeleted(post)) {
            postRepository.delete(post)
        }
    }

    private boolean isDeleted(Post post) {
        return post.getAuthor() == null &&
                post.getTitle() == null &&
                post.getPostdate() == null &&
                post.getBody() == null
    }

}
