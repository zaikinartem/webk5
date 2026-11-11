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

    /** Имя атрибута сессии для текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";

    /** Код ошибки PostgreSQL при нарушении уникальности. */
    private static final String PG_UNIQUE_VIOLATION = "23505";

    /** Сервис для работы с логикой регистрации. */
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
     * @param username логин
     * @param password пароль
     * @param age      возраст
     * @param gender   пол
     * @param city     город
     * @param session  текущая HTTP-сессия
     * @return ответ с данными зарегистрированного пользователя
     */
    @PostMapping
    public ResponseEntity<?> register(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String city,
            HttpSession session) {

        try {
            User user = authService.register(
                    username, password, age, gender, city
            );
            session.setAttribute(SESSION_USER_KEY, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "username", user.getUsername(),
                    "role", user.getRole(),
                    "avatarPath", user.getAvatarPath()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        } catch (SQLException e) {
            if (PG_UNIQUE_VIOLATION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "success", false,
                                "message", "Пользователь уже существует."
                        ));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "success", false,
                            "message", "Ошибка БД."
                    ));
        }
    }
}