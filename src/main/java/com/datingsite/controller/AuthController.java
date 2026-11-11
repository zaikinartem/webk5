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
 * Контроллер для аутентификации пользователей.
 * Обрабатывает запросы на вход, проверку сессии и выход из системы.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Имя атрибута сессии для текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";

    /** Путь к аватару по умолчанию. */
    private static final String DEFAULT_AVATAR = "/uploads/default.jpg";

    /** Значение по умолчанию для неуказанных полей. */
    private static final String NOT_SPECIFIED = "Не указан";

    /** Сервис для работы с логикой аутентификации. */
    private final AuthService authService;

    /**
     * Конструктор контроллера с внедрением зависимости.
     *
     * @param authService сервис аутентификации
     */
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Обрабатывает POST-запрос для входа пользователя в систему.
     *
     * @param username логин пользователя
     * @param password пароль пользователя
     * @param session  текущая HTTP-сессия
     * @return ответ с данными пользователя при успехе или ошибкой
     */
    @PostMapping
    public ResponseEntity<?> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session) {

        try {
            User user = authService.login(username, password);
            if (user != null) {
                session.setAttribute(SESSION_USER_KEY, user);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "username", user.getUsername(),
                        "role", user.getRole(),
                        "avatarPath", user.getAvatarPath() != null
                                ? user.getAvatarPath()
                                : DEFAULT_AVATAR
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Неверный логин или пароль."
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Ошибка БД."));
        }
    }

    /**
     * Обрабатывает GET-запрос для проверки текущей сессии пользователя.
     * Всегда подтягивает актуальные данные из БД (включая счетчик входов).
     *
     * @param session текущая HTTP-сессия
     * @return ответ с флагом авторизации и актуальными данными
     */
    @GetMapping
    public ResponseEntity<?> checkSession(HttpSession session) {
        User sessionUser = (User) session.getAttribute(SESSION_USER_KEY);
        if (sessionUser != null) {
            try {
                User freshUser = authService.getAllUsers().stream()
                        .filter(u -> u.getId().equals(sessionUser.getId()))
                        .findFirst()
                        .orElse(sessionUser);

                session.setAttribute(SESSION_USER_KEY, freshUser);

                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "username", freshUser.getUsername(),
                        "role", freshUser.getRole(),
                        "avatarPath", freshUser.getAvatarPath() != null
                                ? freshUser.getAvatarPath()
                                : DEFAULT_AVATAR,
                        "age", freshUser.getAge() != null
                                ? freshUser.getAge()
                                : 0,
                        "gender", freshUser.getGender() != null
                                ? freshUser.getGender()
                                : NOT_SPECIFIED,
                        "city", freshUser.getCity() != null
                                ? freshUser.getCity()
                                : NOT_SPECIFIED,
                        "loginCount", freshUser.getLoginCount() != null
                                ? freshUser.getLoginCount()
                                : 0
                ));
            } catch (SQLException e) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Ошибка БД."));
            }
        }
        return ResponseEntity.ok(Map.of("authenticated", false));
    }

    /**
     * Обрабатывает DELETE-запрос для выхода пользователя из системы.
     *
     * @param session текущая HTTP-сессия
     * @return ответ об успешном выходе
     */
    @DeleteMapping
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Получает список всех зарегистрированных пользователей.
     * Используется на главной странице для отображения анкет.
     *
     * @return список пользователей без паролей
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = authService.getAllUsers();
            users.forEach(u -> u.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }
}