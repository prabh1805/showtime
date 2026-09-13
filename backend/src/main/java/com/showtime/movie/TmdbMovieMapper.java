package com.showtime.movie;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TmdbMovieMapper {

    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "cast", ignore = true)
    @Mapping(target = "tmdbId", source = "id")
    @Mapping(target = "duration", source = "runtime")
    @Mapping(target = "genre", source = "genres")
    @Mapping(target = "status", source = "status", qualifiedByName = "mapTmdbStatus")
    Movie toMovie(TmdbMovieResponse response);

    default String genreToString(TmdbGenre genre) {
        return genre.getName();
    }

    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "cast", ignore = true)
    @Mapping(target = "tmdbId", source = "id")
    @Mapping(target = "duration", source = "runtime")
    @Mapping(target = "genre", source = "genres")
    @Mapping(target = "status", source = "status", qualifiedByName = "mapTmdbStatus")
    void updateMovieFromTmdb(TmdbMovieResponse response, @MappingTarget Movie existingMovie);


    MovieSummaryResponse toSummaryResponse(Movie movie);

    MovieCatalogResponse toCatalogResponse(Movie movie);

    MovieDetailResponse toDetailResponse(Movie movie);

    @Named("mapTmdbStatus")
    default MovieStatus mapTmdbStatus(String tmdbStatus) {
        if (tmdbStatus == null) {
            return MovieStatus.CANCELLED;
        }
        return switch (tmdbStatus) {
            case "Released" -> MovieStatus.SCHEDULABLE;
            case "Planned", "In Production", "Post Production" -> MovieStatus.UPCOMING;
            case "Canceled", "Rumored" -> MovieStatus.CANCELLED;
            default -> MovieStatus.CANCELLED;
        };
    }

    List<Cast> toCastList(List<TmdbCastMember> castMembers);
}