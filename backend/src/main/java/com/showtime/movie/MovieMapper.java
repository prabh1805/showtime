package com.showtime.movie;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MovieMapper {
    MovieResponse toResponse(Movie movie);

    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "status", ignore = true)
    Movie toEntity(CreateMovieRequest request);
}