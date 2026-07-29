package com.showtime.movie;

import java.time.LocalDate;

public record MovieKey(String title, LocalDate releaseDate) {
}
