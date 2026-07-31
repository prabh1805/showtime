package com.showtime.user;

import com.showtime.admin.CreateOwnerRequest;
import com.showtime.admin.CreateOwnerResponse;
import com.showtime.common.jwt.JwtService;
import com.showtime.refreshtoken.RefreshResult;
import com.showtime.refreshtoken.RefreshTokenService;
import com.showtime.theater.CreateTheaterRequest;
import com.showtime.theater.TheaterResponse;
import com.showtime.theater.TheaterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TheaterService theaterService;

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = userMapper.toEntity(request);
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);

        return userMapper.toResponse(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidUserCredentialsException(request.getEmail()));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidUserCredentialsException(request.getEmail());
        }
        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.issueToken(user);
        return LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    @Transactional
    public LoginResponse refreshAccessToken(RefreshRequest  refreshRequest) {
        RefreshResult refreshResult = refreshTokenService.refreshAndRotate(refreshRequest.getRefreshToken());
        String accessToken = jwtService.generateToken(refreshResult.user());
        String refreshToken = refreshResult.refreshToken();
        return LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    @Transactional
    public void logout(RefreshRequest refreshRequest) {
        refreshTokenService.revokeToken(refreshRequest.getRefreshToken());
    }

    @Transactional
    public CreateOwnerResponse createOwner(CreateOwnerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User owner = new User();
        owner.setEmail(request.getEmail());
        owner.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        owner.setRole(Role.OWNER);
        userRepository.save(owner);

        CreateTheaterRequest theaterRequest = new CreateTheaterRequest();
        theaterRequest.setName(request.getTheaterName());
        theaterRequest.setCity(request.getCity());
        theaterRequest.setAddress(request.getAddress());


        TheaterResponse theaterResponse = theaterService.create(theaterRequest, owner);

        CreateOwnerResponse response = new CreateOwnerResponse();
        response.setOwnerId(owner.getId());
        response.setTheaterId(theaterResponse.getId());
        return response;
    }

    @Transactional
    public LoginResponse changePassword(ChangePasswordRequest request) {
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = getEntityById(Long.valueOf(currUserId));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            log.warn("Password change failed for user: {}", user.getEmail());
            throw new InvalidPasswordException();
        }
        String newPassword = request.getNewPassword();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.issueToken(user);
        return LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    @Transactional
    public RegisterResponse updateUserDetails(UpdateProfileRequest request) {
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = getEntityById(Long.valueOf(currUserId));
        userMapper.updateUserFromDto(request, user);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    public RegisterResponse getMe(){
        String currUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = getEntityById(Long.valueOf(currUserId));
        return userMapper.toResponse(user);
    }

    public User getEntityById(Long id) {
        return  userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
