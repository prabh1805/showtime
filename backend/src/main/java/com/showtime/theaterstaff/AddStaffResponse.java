package com.showtime.theaterstaff;

import com.showtime.user.Role;
import com.showtime.user.User;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AddStaffResponse {
    private Long staffId;
    private String staffEmail;
    private Role staffRole;
    private EmploymentStatus staffEmploymentStatus;
}
