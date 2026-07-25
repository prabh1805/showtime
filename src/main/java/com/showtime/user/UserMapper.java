package com.showtime.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "passwordHash",  ignore = true)
    User toEntity(RegisterRequest request);


    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "email", source = "user.email")
    RegisterResponse toResponse(User user);
}
