package com.showtime.movie;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TmdbCastMember {
    private Long id;
    private String name;
    private String character;
    private int order;
}
