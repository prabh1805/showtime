package com.showtime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ShowtimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShowtimeApplication.class, args);
    }

}
