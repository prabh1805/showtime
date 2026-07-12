package com.showtime.theater;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TheaterController.class)
class TheaterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TheaterService theaterService;

    private TheaterResponse sampleResponse() {
        TheaterResponse response = new TheaterResponse();
        response.setId(1L);
        response.setCity("Bengaluru");
        response.setName("PVR Saket");
        response.setAddress("123 MG Road");
        response.setStatus(TheaterStatus.OPERATIONAL);
        response.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        response.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return response;
    }

    @Test
    void createTheater_validRequest_returns201() throws Exception {
        when(theaterService.create(any(CreateTheaterRequest.class))).thenReturn(sampleResponse());

        String body = """
                {
                  "city": "Bengaluru",
                  "name": "PVR Saket",
                  "address": "123 MG Road",
                  "status": "OPERATIONAL"
                }
                """;

        mockMvc.perform(post("/api/v1/theaters")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.city").value("Bengaluru"))
                .andExpect(jsonPath("$.name").value("PVR Saket"))
                .andExpect(jsonPath("$.status").value("OPERATIONAL"));

        verify(theaterService).create(any(CreateTheaterRequest.class));
    }

    @Test
    void createTheater_missingRequiredFields_returns400WithFieldErrors() throws Exception {
        String body = """
                {
                  "address": "123 MG Road"
                }
                """;

        mockMvc.perform(post("/api/v1/theaters")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors").isArray());

        verifyNoInteractions(theaterService);
    }

    @Test
    void createTheater_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/theaters")
                        .contentType("application/json")
                        .content("{not-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed request body"));
    }

    @Test
    void listTheaters_withoutCity_returnsPage() throws Exception {
        Page<TheaterResponse> page = new PageImpl<>(List.of(sampleResponse()), PageRequest.of(0, 20), 1);
        when(theaterService.listAll(isNull(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/theaters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("PVR Saket"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void listTheaters_withCity_passesCityToService() throws Exception {
        Page<TheaterResponse> page = new PageImpl<>(List.of(sampleResponse()), PageRequest.of(0, 20), 1);
        when(theaterService.listAll(eq("Bengaluru"), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/theaters").param("city", "Bengaluru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].city").value("Bengaluru"));

        verify(theaterService).listAll(eq("Bengaluru"), any(Pageable.class));
    }

    @Test
    void getTheater_found_returns200() throws Exception {
        when(theaterService.getById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/theaters/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("PVR Saket"));
    }

    @Test
    void getTheater_notFound_returns404() throws Exception {
        when(theaterService.getById(99L)).thenThrow(new TheaterNotFoundException(99L));

        mockMvc.perform(get("/api/v1/theaters/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Theater not found with id: 99"));
    }

    @Test
    void deleteTheater_found_returns204() throws Exception {
        doNothing().when(theaterService).softDelete(1L);

        mockMvc.perform(delete("/api/v1/theaters/{id}", 1L))
                .andExpect(status().isNoContent());

        verify(theaterService).softDelete(1L);
    }

    @Test
    void deleteTheater_notFound_returns404() throws Exception {
        doThrow(new TheaterNotFoundException(99L)).when(theaterService).softDelete(99L);

        mockMvc.perform(delete("/api/v1/theaters/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Theater not found with id: 99"));
    }
}
