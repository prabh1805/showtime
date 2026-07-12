package com.showtime.theater;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TheaterServiceTest {

    @Mock
    private TheaterRepository theaterRepository;

    @InjectMocks
    private TheaterService theaterService;

    private Theater theater;

    @BeforeEach
    void setUp() {
        theater = new Theater();
        theater.setId(1L);
        theater.setCity("Bengaluru");
        theater.setName("PVR Saket");
        theater.setAddress("123 MG Road");
        theater.setStatus(TheaterStatus.OPERATIONAL);
        theater.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        theater.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
    }

    private CreateTheaterRequest validRequest() {
        CreateTheaterRequest request = new CreateTheaterRequest();
        request.setCity("Bengaluru");
        request.setName("PVR Saket");
        request.setAddress("123 MG Road");
        request.setStatus(TheaterStatus.OPERATIONAL);
        return request;
    }

    @Test
    void create_savesTheaterAndReturnsMappedResponse() {
        when(theaterRepository.save(any(Theater.class))).thenReturn(theater);

        TheaterResponse response = theaterService.create(validRequest());

        ArgumentCaptor<Theater> captor = ArgumentCaptor.forClass(Theater.class);
        verify(theaterRepository).save(captor.capture());
        Theater saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("PVR Saket");
        assertThat(saved.getCity()).isEqualTo("Bengaluru");
        assertThat(saved.getAddress()).isEqualTo("123 MG Road");
        assertThat(saved.getStatus()).isEqualTo(TheaterStatus.OPERATIONAL);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("PVR Saket");
        assertThat(response.getCity()).isEqualTo("Bengaluru");
        assertThat(response.getAddress()).isEqualTo("123 MG Road");
        assertThat(response.getStatus()).isEqualTo(TheaterStatus.OPERATIONAL);
        assertThat(response.getCreatedAt()).isEqualTo(theater.getCreatedAt());
        assertThat(response.getUpdatedAt()).isEqualTo(theater.getUpdatedAt());
    }

    @Test
    void listAll_withNullCity_usesFindAll() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Theater> page = new PageImpl<>(List.of(theater), pageable, 1);
        when(theaterRepository.findAll(pageable)).thenReturn(page);

        Page<TheaterResponse> result = theaterService.listAll(null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getName()).isEqualTo("PVR Saket");
        verify(theaterRepository).findAll(pageable);
        verify(theaterRepository, never()).findByCity(anyString(), any());
    }

    @Test
    void listAll_withBlankCity_usesFindAll() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Theater> page = new PageImpl<>(List.of(theater), pageable, 1);
        when(theaterRepository.findAll(pageable)).thenReturn(page);

        Page<TheaterResponse> result = theaterService.listAll("   ", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(theaterRepository).findAll(pageable);
        verify(theaterRepository, never()).findByCity(anyString(), any());
    }

    @Test
    void listAll_withCity_usesFindByCity() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Theater> page = new PageImpl<>(List.of(theater), pageable, 1);
        when(theaterRepository.findByCity("Bengaluru", pageable)).thenReturn(page);

        Page<TheaterResponse> result = theaterService.listAll("Bengaluru", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getCity()).isEqualTo("Bengaluru");
        verify(theaterRepository).findByCity("Bengaluru", pageable);
        verify(theaterRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getById_found_returnsMappedResponse() {
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(theater));

        TheaterResponse response = theaterService.getById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("PVR Saket");
    }

    @Test
    void getById_notFound_throwsTheaterNotFoundException() {
        when(theaterRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> theaterService.getById(99L))
                .isInstanceOf(TheaterNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void softDelete_found_setsStatusPermanentlyClosedAndSaves() {
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(theater));
        when(theaterRepository.save(any(Theater.class))).thenReturn(theater);

        theaterService.softDelete(1L);

        ArgumentCaptor<Theater> captor = ArgumentCaptor.forClass(Theater.class);
        verify(theaterRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(TheaterStatus.PERMANENTLY_CLOSED);
    }

    @Test
    void softDelete_notFound_throwsTheaterNotFoundExceptionAndNeverSaves() {
        when(theaterRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> theaterService.softDelete(99L))
                .isInstanceOf(TheaterNotFoundException.class)
                .hasMessageContaining("99");

        verify(theaterRepository, never()).save(any());
    }

    @Test
    void getEntityById_found_returnsEntity() {
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(theater));

        Theater result = theaterService.getEntityById(1L);

        assertThat(result).isSameAs(theater);
    }

    @Test
    void getEntityById_notFound_throwsTheaterNotFoundException() {
        when(theaterRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> theaterService.getEntityById(42L))
                .isInstanceOf(TheaterNotFoundException.class)
                .hasMessageContaining("42");
    }
}
