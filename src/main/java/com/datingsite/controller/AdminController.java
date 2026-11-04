package com.datingsite.controller;

import com.datingsite.model.User;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для административной панели.
 * Предоставляет методы для просмотра всех пользователей и изменения их ролей.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /** Сервис для работы с логикой пользователей. */
    private final AuthService authService;

    /**
     * Конструктор контроллера с внедрением зависимости.
     *
     * @param authService сервис аутентификации
     */
    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Вспомогательный метод для проверки прав администратора.
     *
     * @param session текущая HTTP-сессия
     * @return true, если текущий пользователь является администратором
     */
    private boolean isAdmin(HttpSession session) {
        User user = (User) session.getAttribute("currentUser");
        return user != null && user.getRole().name().equals("ADMIN");
    }

    /**
     * Получает список всех пользователей системы.
     *
     * @param session текущая HTTP-сессия
     * @return список пользователей или ошибку 403, если нет прав
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Доступ запрещен. Требуются права администратора."));
        }

        try {
            List<User> users = authService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Ошибка БД при получении списка пользователей."));
        }
    }

    /**
     * Изменяет роль конкретного пользователя.
     *
     * @param id      идентификатор пользователя
     * @param newRole новая роль (USER, MODERATOR, ADMIN)
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибку
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable int id, 
            @RequestParam String newRole, 
            HttpSession session) {
        
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Доступ запрещен."));
        }

        if (!newRole.equals("USER") && !newRole.equals("MODERATOR") && !newRole.equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Недопустимая роль."));
        }

        try {
            authService.changeUserRole(id, newRole);
            return ResponseEntity.ok(Map.of("success", true, "message", "Роль успешно обновлена."));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Ошибка БД при обновлении роли."));
        }
    }
}