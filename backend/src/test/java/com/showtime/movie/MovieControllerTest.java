package com.showtime.movie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MovieController.class)
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MovieService movieService;

    @Test
    void createBatch_validRequest_returns207WithResults() throws Exception {
        MovieBatchResponse response = new MovieBatchResponse(
                java.util.List.of(new MovieBatchSuccess(0, "m1", "Inception"))
        );
        when(movieService.createBatch(any(BulkCreateMovieRequest.class))).thenReturn(response);

        String body = """
                {
                  "movies": [
                    {
                      "title": "Inception",
                      "duration": 148,
                      "releaseDate": "2010-07-16",
                      "availableLanguages": ["English"],
                      "availableFormats": ["TWO_D"]
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/movies/batch")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isMultiStatus())
                .andExpect(jsonPath("$.results[0].index").value(0))
                .andExpect(jsonPath("$.results[0].movieId").value("m1"))
                .andExpect(jsonPath("$.results[0].title").value("Inception"));

        verify(movieService).createBatch(any(BulkCreateMovieRequest.class));
    }

    @Test
    void createBatch_emptyMoviesList_returns400() throws Exception {
        String body = """
                {
                  "movies": []
                }
                """;

        mockMvc.perform(post("/api/v1/movies/batch")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        verifyNoInteractions(movieService);
    }

    @Test
    void createBatch_missingRequiredFieldsInNestedMovie_returns400WithFieldErrors() throws Exception {
        String body = """
                {
                  "movies": [
                    {
                      "duration": 148
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/movies/batch")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.fieldErrors", hasSize(greaterThan(0))));

        verifyNoInteractions(movieService);
    }

    @Test
    void createBatch_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/movies/batch")
                        .contentType("application/json")
                        .content("{not-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed request body"));
    }
}
