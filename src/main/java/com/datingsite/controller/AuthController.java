package com.datingsite.controller;

import com.datingsite.model.User;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Контроллер для аутентификации пользователей.
 * Обрабатывает запросы на вход, проверку сессии и выход из системы.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
     * @return ответ с данными пользователя при успехе или сообщением об ошибке
     */
    @PostMapping
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password, HttpSession session) {
        try {
            User user = authService.login(username, password);
            if (user != null) {
                session.setAttribute("currentUser", user);
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "username", user.getUsername(), 
                    "role", user.getRole(),
                    "avatarPath", user.getAvatarPath() != null ? user.getAvatarPath() : "/uploads/default.jpg"
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Неверный логин или пароль."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Ошибка БД."));
        }
    }

    /**
     * Обрабатывает GET-запрос для проверки текущей сессии пользователя.
     *
     * @param session текущая HTTP-сессия
     * @return ответ с флагом авторизации и данными пользователя (если авторизован)
     */
    @GetMapping
    public ResponseEntity<?> checkSession(HttpSession session) {
        User user = (User) session.getAttribute("currentUser");
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", user.getUsername(),
                "role", user.getRole(),
                "avatarPath", user.getAvatarPath() != null ? user.getAvatarPath() : "/uploads/default.jpg"
            ));
        }
        return ResponseEntity.ok(Map.of("authenticated", false));
    }

    /**
     * Обрабатывает DELETE-запрос для выхода пользователя из системы.
     * Уничтожает текущую сессию.
     *
     * @param session текущая HTTP-сессия
     * @return ответ об успешном выходе
     */
    @DeleteMapping
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }
}