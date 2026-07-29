package com.showtime.theaterstaff;

import com.showtime.theater.Theater;
import com.showtime.theater.TheaterService;
import com.showtime.user.Role;
import com.showtime.user.User;
import com.showtime.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TheaterStaffService {
    private final TheaterStaffRepository theaterStaffRepository;
    private final UserService userService;
    private final TheaterService theaterService;

    @Transactional
    public TheaterStaff addStaff(Long userId, Long theaterId) {
        User user = userService.getEntityById(userId);
        Theater theater = theaterService.getEntityById(theaterId);

        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User callerUser = userService.getEntityById(Long.valueOf(currUserId));

        var authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();

        boolean isOwner = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
        boolean isStaff = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        boolean isOwnerRight = theater.getOwner().getId().equals(callerUser.getId());
        boolean callerIsActiveStaffHere = theaterStaffRepository.
                existsByUserAndTheaterAndStatus(
                        callerUser,
                        theater,
                        EmploymentStatus.WORKING
                );

        if ((!isStaff && !isOwner)
                || (isOwner && !isOwnerRight)
                || (isStaff && !callerIsActiveStaffHere)) {
            throw new UnauthorizedTheaterAccessException(theater.getName());
        }

        boolean targetAlreadyStaff = theaterStaffRepository
                .existsByUserAndTheaterAndStatus(
                        user,
                        theater,
                        EmploymentStatus.WORKING
                );
        if (targetAlreadyStaff) {
            throw new DuplicateStaffException(userId, theaterId);
        }

        if(user.getRole() != Role.CUSTOMER){
            throw new UserAlreadyHasRoleException(userId);
        }
        user.setRole(Role.STAFF);
        TheaterStaff theaterStaff = new TheaterStaff();
        theaterStaff.setUser(user);
        theaterStaff.setTheater(theater);

        return theaterStaffRepository.save(theaterStaff);
    }
}
