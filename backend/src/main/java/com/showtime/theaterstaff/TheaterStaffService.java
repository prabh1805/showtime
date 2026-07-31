package com.showtime.theaterstaff;

import com.showtime.theater.Theater;
import com.showtime.theater.TheaterService;
import com.showtime.user.DuplicateEmailException;
import com.showtime.user.Role;
import com.showtime.user.User;
import com.showtime.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TheaterStaffService {
    private final TheaterStaffRepository theaterStaffRepository;
    private final UserService userService;
    private final TheaterService theaterService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AddStaffResponse addStaff(Long theaterId, AddStaffRequest request) {
        Theater theater = theaterService.getEntityById(theaterId);

        // 1. Authorize the caller: must be owner, or active staff at THIS theater
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User callerUser = userService.getEntityById(Long.valueOf(currUserId));

        var authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        boolean isOwner = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
        boolean isStaff = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        boolean isOwnerRight = theater.getOwner().getId().equals(callerUser.getId());
        boolean callerIsActiveStaffHere = theaterStaffRepository
                .existsByUserAndTheaterAndStatus(callerUser, theater, EmploymentStatus.WORKING);

        if ((!isStaff && !isOwner)
                || (isOwner && !isOwnerRight)
                || (isStaff && !callerIsActiveStaffHere)) {
            throw new UnauthorizedTheaterAccessException(theater.getName());
        }

        // 2. Duplicate-email check for the NEW person being added
        if (userService.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        // 3. Create the new User, role STAFF from the start
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setMobileNumber(request.getMobileNumber());
        newUser.setRole(Role.STAFF);
        userService.save(newUser);

        // 4. Create the TheaterStaff row
        TheaterStaff theaterStaff = new TheaterStaff();
        theaterStaff.setUser(newUser);
        theaterStaff.setTheater(theater);

        TheaterStaff res =  theaterStaffRepository.save(theaterStaff);
        return AddStaffResponse.builder()
                .staffId(newUser.getId())
                .staffEmail(newUser.getEmail())
                .staffRole(newUser.getRole())
                .staffEmploymentStatus(theaterStaff.getStatus())
                .build();
    }
}