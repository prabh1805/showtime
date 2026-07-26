package com.showtime.refreshtoken;

import com.showtime.user.User;

public record RefreshResult(User user, String refreshToken) {}
