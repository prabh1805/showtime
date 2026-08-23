package com.showtime.theater;

import com.showtime.user.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class TheaterSpecifications {

    private TheaterSpecifications() {}

    public static Specification<Theater> hasCity(String city) {
        return (root, query, cb) ->
                city == null || city.isBlank()
                        ? null
                        : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Theater> hasTheaterName(String name) {
        return (root, query, cb) ->
                name == null || name.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Theater> hasOwnerName(String ownerName) {
        return (root, query, cb) -> {
            if (ownerName == null || ownerName.isBlank()) {
                return null;
            }
            Join<Theater, User> ownerJoin = root.join("owner");
            String pattern = "%" + ownerName.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(ownerJoin.get("firstName")), pattern),
                    cb.like(cb.lower(ownerJoin.get("lastName")), pattern)
            );
        };
    }

    public static Specification<Theater> fetchOwner() {
        return (root, query, cb) -> {
            if (Theater.class.equals(query.getResultType())) {
                root.fetch("owner", JoinType.LEFT);
            }
            return null;
        };
    }
}