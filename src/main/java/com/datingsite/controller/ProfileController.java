package com.datingsite.controller;

import com.datingsite.model.User;
import com.datingsite.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;

/**
 * Контроллер для управления профилем пользователя (загрузка аватара).
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    /** Имя атрибута сессии для текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";

    /** Директория для сохранения загруженных файлов. */
    private static final String UPLOAD_DIR = "uploads";

    /** Сервис для работы с логикой пользователей. */
    private final AuthService authService;

    /**
     * Конструктор контроллера с внедрением зависимости.
     *
     * @param authService сервис аутентификации
     */
    public ProfileController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Обрабатывает POST-запрос для загрузки аватара пользователя.
     * Проверяет наличие сессии, тип файла и сохраняет его на сервере.
     *
     * @param file    загружаемый файл
     * @param session текущая HTTP-сессия
     * @return ответ с путем к файлу или сообщением об ошибке
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        User user = (User) session.getAttribute(SESSION_USER_KEY);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Файл не выбран или пуст."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", 
                            "Разрешена загрузка только изображений."
                    ));
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

            file.transferTo(new File(
                    uploadPath + File.separator + fileName
            ));
            String avatarUrl = "/" + UPLOAD_DIR + "/" + fileName;

            authService.updateAvatar(user.getUsername(), avatarUrl);
            user.setAvatarPath(avatarUrl);
            session.setAttribute(SESSION_USER_KEY, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "avatarPath", avatarUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", 
                            "Ошибка при загрузке файла."
                    ));
        }
    }
}