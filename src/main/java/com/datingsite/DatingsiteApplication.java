package com.datingsite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Главный класс приложения Spring Boot.
 * Запускает встроенный сервер Tomcat и инициализирует контекст приложения.
 */
@SpringBootApplication
public class DatingsiteApplication {

    /**
     * Точка входа в приложение.
     * Запускает Spring Boot приложение и встроенный веб-сервер.
     *
     * @param args аргументы командной строки
     */
    public static void main(String[] args) {
        SpringApplication.run(DatingsiteApplication.class, args);
    }
}