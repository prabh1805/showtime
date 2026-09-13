package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection= "movies")
@Getter
@Setter
@NoArgsConstructor
public class Movie {
    @Id
    private String movieId;
    private String title;
    private int duration;
    private List<Cast> cast;
    private List<String> genre;
    private String posterPath;
    private String backdropPath;
    private MovieStatus status;
    private LocalDate releaseDate;
    @Indexed(unique = true)
    private String tmdbId;
}
