package com.datingsite.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Контроллер для получения информации о статусе сервера и количестве посещений.
 */
@RestController
@RequestMapping("/api/info")
public class InfoController {

    /** Атомарный счетчик посещений. */
    private static final AtomicInteger counter = new AtomicInteger(0);
    
    /** Ключ сессии для отслеживания уникального визита. */
    private static final String VISITED_KEY = "visited";

    /**
     * Обрабатывает GET-запрос для получения текущего времени и счетчика посещений.
     * Увеличивает счетчик только при первом визите пользователя в рамках текущей сессии.
     *
     * @param session текущая HTTP-сессия
     * @return карта с текущим временем и количеством посещений
     */
    @GetMapping
    public Map<String, Object> getInfo(HttpSession session) {
        if (session.getAttribute(VISITED_KEY) == null) {
            counter.incrementAndGet();
            session.setAttribute(VISITED_KEY, true);
        }
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss"));
        return Map.of("dateTime", currentTime, "visitCount", counter.get());
    }
}