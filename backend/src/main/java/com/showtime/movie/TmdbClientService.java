package com.showtime.movie;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;

import java.util.List;


@Component
@RequiredArgsConstructor
public class TmdbClientService {
    private final RestClient tmdbClient;

    public TmdbSearchResponse searchMovies(String query) {
        try{
            return tmdbClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/movie")
                            .queryParam("query", query)
                            .build()
                    ).retrieve().body(TmdbSearchResponse.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // TMDB actually responded, but with a bad status (401, 404, 429, 500...)
            throw new TmdbSyncException(
                    "TMDB returned an error for movie with name " + query + ": " + e.getStatusCode(),
                    e.getStatusCode().value()
            );

        } catch (ResourceAccessException e) {
            // No response at all — network down, timeout, DNS failure
            throw new TmdbSyncException(
                    "Could not reach TMDB while fetching movie with name " + query,
                    0 // no real HTTP status exists here
            );

        } catch (RestClientException e) {
            // Catch-all for anything else — e.g. deserialization mismatch
            throw new TmdbSyncException(
                    "Unexpected error processing TMDB response for movie with name " + query,
                    0
            );
        }

    }

    public TmdbMovieResponse fetchMovieDetails(Long tmdbId) {
        try {
            return tmdbClient.get()
                    .uri("/movie/{id}", tmdbId)
                    .retrieve()
                    .body(TmdbMovieResponse.class);

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // TMDB actually responded, but with a bad status (401, 404, 429, 500...)
            throw new TmdbSyncException(
                    "TMDB returned an error for movie id " + tmdbId + ": " + e.getStatusCode(),
                    e.getStatusCode().value()
            );

        } catch (ResourceAccessException e) {
            // No response at all — network down, timeout, DNS failure
            throw new TmdbSyncException(
                    "Could not reach TMDB while fetching movie id " + tmdbId,
                    0 // no real HTTP status exists here
            );

        } catch (RestClientException e) {
            // Catch-all for anything else — e.g. deserialization mismatch
            throw new TmdbSyncException(
                    "Unexpected error processing TMDB response for movie id " + tmdbId,
                    0
            );
        }
    }

    public TmdbCreditResponse fetchCreditDetails(Long tmdbId) {
        try{
            return tmdbClient.get()
                    .uri("/movie/{id}/credits", tmdbId)
                    .retrieve()
                    .body(TmdbCreditResponse.class);
        }catch (HttpClientErrorException | HttpServerErrorException e) {
            // TMDB actually responded, but with a bad status (401, 404, 429, 500...)
            throw new TmdbSyncException(
                    "TMDB returned an error for movie id " + tmdbId + ": " + e.getStatusCode(),
                    e.getStatusCode().value()
            );

        } catch (ResourceAccessException e) {
            // No response at all — network down, timeout, DNS failure
            throw new TmdbSyncException(
                    "Could not reach TMDB while fetching movie id " + tmdbId,
                    0 // no real HTTP status exists here
            );

        } catch (RestClientException e) {
            // Catch-all for anything else — e.g. deserialization mismatch
            throw new TmdbSyncException(
                    "Unexpected error processing TMDB response for movie id " + tmdbId,
                    0
            );
        }
    }
}
