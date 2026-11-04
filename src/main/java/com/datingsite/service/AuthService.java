package com.datingsite.service;

import com.datingsite.model.Role;
import com.datingsite.model.User;
import com.datingsite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

/**
 * Сервисный слой для аутентификации, регистрации и управления пользователями.
 */
@Service
public class AuthService {

    /** Репозиторий для работы с данными пользователей. */
    private final UserRepository userRepository;
    
    /** Путь к аватару по умолчанию. */
    private static final String DEFAULT_AVATAR = "/uploads/default.jpg";

    /**
     * Конструктор сервиса с внедрением зависимости.
     *
     * @param userRepository репозиторий пользователей
     */
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Выполняет вход пользователя в систему.
     *
     * @param username логин пользователя
     * @param password пароль пользователя
     * @return объект {@link User} при успешной аутентификации
     * @throws IllegalArgumentException если логин или пароль пусты
     * @throws SQLException             при ошибках работы с базой данных
     */
    public User login(String username, String password) throws SQLException {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Логин и пароль обязательны.");
        }
        return userRepository.findByCredentials(username.trim(), password.trim());
    }

    /**
     * Регистрирует нового пользователя в системе.
     *
     * @param username логин нового пользователя
     * @param password пароль нового пользователя
     * @return объект созданного {@link User}
     * @throws IllegalArgumentException если логин или пароль пусты
     * @throws SQLException             при ошибках работы с базой данных
     */
    public User register(String username, String password) throws SQLException {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Все поля обязательны.");
        }
        
        String cleanUsername = username.trim();
        userRepository.save(cleanUsername, password.trim(), Role.USER.name(), DEFAULT_AVATAR);
        
        User user = new User();
        user.setUsername(cleanUsername);
        user.setRole(Role.USER);
        user.setAvatarPath(DEFAULT_AVATAR);
        return user;
    }

    /**
     * Обновляет путь к аватару пользователя.
     *
     * @param username   логин пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatar(String username, String avatarPath) throws SQLException {
        userRepository.updateAvatar(username, avatarPath);
    }

    /**
     * Получает список всех пользователей (для администратора).
     *
     * @return список всех пользователей
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<User> getAllUsers() throws SQLException {
        return userRepository.findAll();
    }

    /**
     * Изменяет роль пользователя (для администратора).
     *
     * @param id   идентификатор пользователя
     * @param role новая роль
     * @throws SQLException при ошибках работы с базой данных
     */
    public void changeUserRole(int id, String role) throws SQLException {
        userRepository.updateRole(id, role);
    }
}