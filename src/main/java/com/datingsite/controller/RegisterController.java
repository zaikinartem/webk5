package com.datingsite.controller;

import com.datingsite.model.User;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.Map;

/**
 * Контроллер для регистрации новых пользователей.
 */
@RestController
@RequestMapping("/api/register")
public class RegisterController {

    /** Сервис для работы с логикой аутентификации и регистрации. */
    private final AuthService authService;

    /**
     * Конструктор контроллера с внедрением зависимости.
     *
     * @param authService сервис аутентификации
     */
    public RegisterController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Обрабатывает POST-запрос для регистрации нового пользователя.
     *
     * @param username логин нового пользователя
     * @param password пароль нового пользователя
     * @param session  текущая HTTP-сессия
     * @return ответ с данными зарегистрированного пользователя или сообщением об ошибке
     */
    @PostMapping
    public ResponseEntity<?> register(@RequestParam String username, @RequestParam String password, HttpSession session) {
        try {
            User user = authService.register(username, password);
            session.setAttribute("currentUser", user);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "username", user.getUsername(), 
                "role", user.getRole(),
                "avatarPath", user.getAvatarPath()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", "Пользователь уже существует."));
            }
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Ошибка БД."));
        }
    }
}