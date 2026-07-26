package com.showtime.common.config;

import java.util.List;

public final class SecurityPaths {
    private SecurityPaths() {}

    public static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/users/register",
            "/api/v1/users/login"
    );
}