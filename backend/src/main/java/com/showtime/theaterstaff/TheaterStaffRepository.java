package com.showtime.theaterstaff;

import com.showtime.theater.Theater;
import com.showtime.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheaterStaffRepository extends JpaRepository<TheaterStaff, Long> {
    boolean existsByUserAndTheaterAndStatus(User user, Theater theater, EmploymentStatus status);
}
