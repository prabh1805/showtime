package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection= "movies")
@CompoundIndex(name = "uk_title_releaseDate", def = "{'title': 1, 'releaseDate': 1}", unique = true)
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
    private List<String> availableLanguages;
    private List<MovieFormat> availableFormats;
    private LocalDate releaseDate;
}
