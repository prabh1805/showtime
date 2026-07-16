package com.showtime.show;

import com.showtime.movie.Movie;
import com.showtime.screen.Screen;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ShowMapper {

    @Mapping(target = "id",  ignore = true)
    @Mapping(target = "screen", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "status",  ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Show toEntity(CreateShowRequest request);

    @Mapping(target = "movieTitle", source = "movie.title")
    @Mapping(target = "screenName", source = "screen.name")
    @Mapping(target = "screenId", source = "screen.id")
    @Mapping(target = "movieId", source = "show.movieId")
    @Mapping(target = "id", source = "show.id")
    @Mapping(target = "status", source = "show.status")
    @Mapping(target = "createdAt", source = "show.createdAt")
    ShowResponse toResponse(Show show, Movie movie, Screen screen);
}
