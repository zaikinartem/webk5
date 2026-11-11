package com.datingsite.controller;

import com.datingsite.model.User;
import com.datingsite.repository.LikeRepository;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.Map;

/**
 * Контроллер для управления профилем пользователя и лайками.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    /** Имя атрибута сессии для текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";

    /** Код ошибки PostgreSQL при нарушении уникальности. */
    private static final String PG_UNIQUE_VIOLATION = "23505";

    /** Сервис для работы с логикой пользователей. */
    private final AuthService authService;

    /** Репозиторий для работы с лайками. */
    private final LikeRepository likeRepository;

    /**
     * Конструктор контроллера с внедрением зависимостей.
     *
     * @param authService    сервис аутентификации
     * @param likeRepository репозиторий лайков
     */
    public UserController(AuthService authService,
                          LikeRepository likeRepository) {
        this.authService = authService;
        this.likeRepository = likeRepository;
    }

    /**
     * Обновляет данные профиля текущего пользователя.
     *
     * @param newUsername новый логин
     * @param password    новый пароль
     * @param age         возраст
     * @param gender      пол
     * @param city        город
     * @param session     текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam String newUsername,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String city,
            HttpSession session) {

        User currentUser = (User) session.getAttribute(SESSION_USER_KEY);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        try {
            User updatedUser = authService.updateProfile(
                    currentUser.getId(), newUsername,
                    password, age, gender, city
            );

            updatedUser.setRole(currentUser.getRole());
            updatedUser.setAvatarPath(currentUser.getAvatarPath());
            updatedUser.setLoginCount(currentUser.getLoginCount());

            session.setAttribute(SESSION_USER_KEY, updatedUser);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Профиль обновлен."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            if (PG_UNIQUE_VIOLATION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", 
                                "Этот логин уже занят."
                        ));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Ставит лайк другому пользователю.
     *
     * @param targetId идентификатор пользователя, которому ставят лайк
     * @param session  текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @PostMapping("/like/{targetId}")
    public ResponseEntity<?> likeUser(
            @PathVariable int targetId,
            HttpSession session) {

        User currentUser = (User) session.getAttribute(SESSION_USER_KEY);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        if (currentUser.getId() == targetId) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", 
                            "Нельзя лайкнуть самого себя."
                    ));
        }

        try {
            likeRepository.saveLike(currentUser.getId(), targetId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Лайк отправлен!"
            ));
        } catch (SQLException e) {
            if (PG_UNIQUE_VIOLATION.equals(e.getSQLState())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", 
                                "Вы уже лайкнули этого пользователя."
                        ));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Получает список избранных пользователей текущего пользователя.
     *
     * @param session текущая HTTP-сессия
     * @return список пользователей
     */
    @GetMapping("/liked")
    public ResponseEntity<?> getLikedUsers(HttpSession session) {
        User currentUser = (User) session.getAttribute(SESSION_USER_KEY);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        try {
            return ResponseEntity.ok(
                    likeRepository.getLikedUsers(currentUser.getId())
            );
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }

    /**
     * Удаляет лайк у пользователя (дизлайк).
     *
     * @param targetId идентификатор пользователя
     * @param session  текущая HTTP-сессия
     * @return ответ об успехе или ошибке
     */
    @DeleteMapping("/like/{targetId}")
    public ResponseEntity<?> unlikeUser(
            @PathVariable int targetId,
            HttpSession session) {

        User currentUser = (User) session.getAttribute(SESSION_USER_KEY);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        try {
            likeRepository.removeLike(currentUser.getId(), targetId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Лайк убран."
            ));
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Ошибка БД."));
        }
    }
}