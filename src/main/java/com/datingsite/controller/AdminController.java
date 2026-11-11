package com.datingsite.controller;

import com.datingsite.model.Role;
import com.datingsite.model.User;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для административной панели.
 * Предоставляет методы для управления пользователями.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /** Имя атрибута сессии для текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";

    /** Код ошибки PostgreSQL при нарушении уникальности (дубликат). */
    private static final String PG_UNIQUE_VIOLATION = "23505";

    /** Код ошибки PostgreSQL при срабатывании триггера (защита админа). */
    private static final String PG_TRIGGER_EXCEPTION = "P0001";

    /** Имя папки для загрузки файлов. */
    private static final String UPLOAD_DIR = "uploads";

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
        User user = (User) session.getAttribute(SESSION_USER_KEY);
        return user != null && user.getRole() == Role.ADMIN;
    }

    /**
     * Получает список всех пользователей системы.
     *
     * @param session текущая HTTP-сессия
     * @return список пользователей или ошибку 403
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        try {
            List<User> users = authService.getAllUsers();
            users.forEach(u -> u.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Изменяет роль конкретного пользователя.
     *
     * @param id      идентификатор пользователя
     * @param newRole новая роль
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable int id,
            @RequestParam String newRole,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        if (!newRole.equals("USER")
                && !newRole.equals("MODERATOR")
                && !newRole.equals("ADMIN")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Недопустимая роль."));
        }
        try {
            authService.changeUserRole(id, newRole);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Создает нового пользователя.
     *
     * @param username логин
     * @param password пароль
     * @param role     роль
     * @param age      возраст
     * @param gender   пол
     * @param city     город
     * @param session  текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String role,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String city,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        try {
            authService.createUser(username, password, role, age, gender, city);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (SQLException e) {
            if (PG_UNIQUE_VIOLATION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Логин занят."));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Обновляет данные профиля конкретного пользователя.
     *
     * @param id          идентификатор пользователя
     * @param newUsername новый логин
     * @param password    новый пароль
     * @param age         возраст
     * @param gender      пол
     * @param city        город
     * @param session     текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUserByAdmin(
            @PathVariable int id,
            @RequestParam String newUsername,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String city,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        try {
            authService.updateProfile(id, newUsername, password, age, gender, city);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (SQLException e) {
            if (PG_UNIQUE_VIOLATION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Логин занят."));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Удаляет пользователя.
     *
     * @param id      идентификатор пользователя
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable int id,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        try {
            authService.deleteUser(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (SQLException e) {
            if (PG_TRIGGER_EXCEPTION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Пользователь защищен."));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Обновляет аватар конкретного пользователя.
     *
     * @param id      идентификатор пользователя
     * @param file    загружаемый файл
     * @param session текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PostMapping("/users/{id}/avatar")
    public ResponseEntity<?> updateUserAvatar(
            @PathVariable int id,
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Доступ запрещен."));
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Файл не выбран."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Разрешены только изображения."));
        }

        try {
            String fileName = System.currentTimeMillis()
                    + "_" + file.getOriginalFilename();
            String uploadPath = System.getProperty("user.dir")
                    + File.separator + UPLOAD_DIR;
            File uploadDir = new File(uploadPath);
            
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            file.transferTo(new File(uploadPath + File.separator + fileName));
            String avatarUrl = "/" + UPLOAD_DIR + "/" + fileName;

            authService.updateAvatarById(id, avatarUrl);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "avatarPath", avatarUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка загрузки."));
        }
    }
}