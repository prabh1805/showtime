package com.showtime.admin;

import com.showtime.theater.CreateTheaterRequest;
import com.showtime.theater.Theater;
import com.showtime.theater.TheaterResponse;
import com.showtime.theater.TheaterService;
import com.showtime.user.DuplicateEmailException;
import com.showtime.user.Role;
import com.showtime.user.User;
import com.showtime.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserService userService;
    private final TheaterService theaterService;

    @Transactional
    public CreateOwnerResponse createOwner(CreateOwnerRequest request) {
        User user = new  User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.OWNER);

        user =  userService.createUser(user, request.getPassword());

        Theater theater = new Theater();
        theater.setName(request.getTheaterName());
        theater.setAddress(request.getAddress());
        theater.setCity(request.getCity());

        theater = theaterService.createTheater(theater, user);

        CreateOwnerResponse response = new CreateOwnerResponse();
        response.setOwnerId(user.getId());
        response.setTheaterId(theater.getId());

        return response;
    }

}
