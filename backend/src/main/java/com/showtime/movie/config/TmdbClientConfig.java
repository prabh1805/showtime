package com.showtime.movie.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class TmdbClientConfig {
    @Value("${tmdb.api.read.access.token}")
    private String tmdbApiReadAccessToken;

    @Value("${tmdb.base.url}")
    private String tmdbBaseUrl;

    @Bean
    public RestClient tmdbRestClient(RestClient.Builder builder) {
        return builder
                .baseUrl(tmdbBaseUrl)
                .defaultHeader("Authorization", "Bearer " + tmdbApiReadAccessToken)
                .build();
    }
}
