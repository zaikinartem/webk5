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
     * Выполняет вход пользователя и увеличивает счетчик его входов.
     *
     * @param username логин пользователя
     * @param password пароль пользователя
     * @return объект {@link User} при успешной аутентификации
     * @throws IllegalArgumentException если логин или пароль пусты
     * @throws SQLException             при ошибках работы с базой данных
     */
    public User login(String username, String password) 
            throws SQLException {
        if (username == null || username.trim().isEmpty() 
                || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Логин и пароль обязательны."
            );
        }

        User user = userRepository.findByCredentials(
                username.trim(), password.trim()
        );
        
        if (user != null) {
            userRepository.incrementLoginCount(user.getId());
            int currentCount = user.getLoginCount() != null 
                    ? user.getLoginCount() 
                    : 0;
            user.setLoginCount(currentCount + 1);
        }
        return user;
    }

    /**
     * Регистрирует нового пользователя в системе (роль USER).
     *
     * @param username логин
     * @param password пароль
     * @param age      возраст
     * @param gender   пол
     * @param city     город
     * @return объект созданного {@link User}
     * @throws IllegalArgumentException если логин или пароль пусты
     * @throws SQLException             при ошибках работы с базой данных
     */
    public User register(String username, String password, 
                         Integer age, String gender, String city) 
            throws SQLException {
        if (username == null || username.trim().isEmpty() 
                || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Логин и пароль обязательны."
            );
        }

        String cleanUsername = username.trim();
        userRepository.save(
                cleanUsername, 
                password.trim(), 
                Role.USER.name(), 
                DEFAULT_AVATAR, 
                age, 
                gender, 
                city
        );

        User user = new User();
        user.setUsername(cleanUsername);
        user.setRole(Role.USER);
        user.setAvatarPath(DEFAULT_AVATAR);
        user.setAge(age);
        user.setGender(gender);
        user.setCity(city);
        user.setLoginCount(1);
        return user;
    }

    /**
     * Создает пользователя с указанной ролью (для администратора).
     *
     * @param username логин
     * @param password пароль
     * @param role     роль
     * @param age      возраст
     * @param gender   пол
     * @param city     город
     * @throws SQLException при ошибках работы с базой данных
     */
    public void createUser(String username, String password, 
                           String role, Integer age, 
                           String gender, String city) 
            throws SQLException {
        userRepository.save(
                username, 
                password, 
                role, 
                DEFAULT_AVATAR, 
                age, 
                gender, 
                city
        );
    }

    /**
     * Удаляет пользователя по идентификатору.
     *
     * @param id идентификатор пользователя
     * @throws SQLException при ошибках работы с базой данных
     */
    public void deleteUser(int id) throws SQLException {
        userRepository.deleteById(id);
    }

    /**
     * Обновляет путь к аватару пользователя по логину.
     *
     * @param username   логин пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatar(String username, String avatarPath) 
            throws SQLException {
        userRepository.updateAvatar(username, avatarPath);
    }

    /**
     * Обновляет путь к аватару пользователя по ID.
     *
     * @param id         идентификатор пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatarById(int id, String avatarPath) 
            throws SQLException {
        userRepository.updateAvatarById(id, avatarPath);
    }

    /**
     * Получает список всех пользователей.
     *
     * @return список всех пользователей
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<User> getAllUsers() throws SQLException {
        return userRepository.findAll();
    }

    /**
     * Изменяет роль пользователя.
     *
     * @param id   идентификатор пользователя
     * @param role новая роль
     * @throws SQLException при ошибках работы с базой данных
     */
    public void changeUserRole(int id, String role) 
            throws SQLException {
        userRepository.updateRole(id, role);
    }

    /**
     * Обновляет данные профиля пользователя.
     *
     * @param id       идентификатор пользователя
     * @param username новый логин
     * @param password новый пароль
     * @param age      возраст
     * @param gender   пол
     * @param city     город
     * @return обновленный объект {@link User}
     * @throws IllegalArgumentException если логин пуст
     * @throws SQLException             при ошибках работы с базой данных
     */
    public User updateProfile(int id, String username, String password, 
                              Integer age, String gender, String city) 
            throws SQLException {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Логин не может быть пустым."
            );
        }

        userRepository.updateProfile(
                id, 
                username.trim(), 
                password, 
                age, 
                gender, 
                city
        );

        User user = new User();
        user.setId(id);
        user.setUsername(username.trim());
        user.setPassword(password);
        user.setAge(age);
        user.setGender(gender);
        user.setCity(city);
        return user;
    }
}