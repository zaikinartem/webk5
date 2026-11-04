package com.datingsite.controller;

import com.datingsite.model.News;
import com.datingsite.model.Role;
import com.datingsite.model.User;
import com.datingsite.service.NewsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для работы с новостной лентой.
 * Предоставляет публичный доступ к чтению и защищенный доступ к редактированию.
 */
@RestController
@RequestMapping("/api/news")
public class NewsController {

    /** Сервис для работы с новостями. */
    private final NewsService newsService;

    /**
     * Конструктор контроллера с внедрением зависимости.
     *
     * @param newsService сервис новостей
     */
    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    /**
     * Вспомогательный метод для проверки прав на редактирование новостей.
     *
     * @param session текущая HTTP-сессия
     * @return true, если пользователь является администратором или модератором
     */
    private boolean canManageNews(HttpSession session) {
        User user = (User) session.getAttribute("currentUser");
        if (user == null) return false;
        return user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR;
    }

    /**
     * Получает список всех новостей (доступно всем).
     *
     * @return список новостей
     */
    @GetMapping
    public ResponseEntity<?> getAllNews() {
        try {
            List<News> newsList = newsService.getAllNews();
            return ResponseEntity.ok(newsList);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Ошибка БД при получении новостей."));
        }
    }

    /**
     * Создает новую новость (только для модераторов и админов).
     *
     * @param title   заголовок
     * @param content текст новости
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PostMapping
    public ResponseEntity<?> createNews(
            @RequestParam String title, 
            @RequestParam String content, 
            HttpSession session) {
        
        if (!canManageNews(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Доступ запрещен. Требуются права модератора."));
        }

        User user = (User) session.getAttribute("currentUser");

        try {
            newsService.createNews(title, content, user.getUsername());
            return ResponseEntity.ok(Map.of("success", true, "message", "Новость успешно добавлена."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Ошибка БД при создании новости."));
        }
    }

    /**
     * Редактирует существующую новость (только для модераторов и админов).
     *
     * @param id      идентификатор новости
     * @param title   новый заголовок
     * @param content новый текст
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNews(
            @PathVariable int id,
            @RequestParam String title, 
            @RequestParam String content, 
            HttpSession session) {
        
        if (!canManageNews(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Доступ запрещен."));
        }

        try {
            newsService.updateNews(id, title, content);
            return ResponseEntity.ok(Map.of("success", true, "message", "Новость обновлена."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Ошибка БД при обновлении новости."));
        }
    }
}