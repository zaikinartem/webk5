package com.datingsite.repository;

import com.datingsite.model.Role;
import com.datingsite.model.User;
import com.datingsite.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Слой доступа к данным (Data Access Object) для работы с таблицей users.
 */
@Repository
public class UserRepository {

    /** SQL-запрос для поиска пользователя по логину и паролю. */
    private static final String SQL_FIND_BY_CREDENTIALS = 
            "SELECT * FROM users WHERE username = ? AND password = ?";

    /** SQL-запрос для добавления нового пользователя. */
    private static final String SQL_INSERT_USER = 
            "INSERT INTO users (" +
            "username, password, role, avatar_path, " +
            "age, gender, city, login_count" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, 1)";

    /** SQL-запрос для обновления аватара по логину. */
    private static final String SQL_UPDATE_AVATAR = 
            "UPDATE users SET avatar_path = ? WHERE username = ?";

    /** SQL-запрос для обновления аватара по id. */
    private static final String SQL_UPDATE_AVATAR_BY_ID = 
            "UPDATE users SET avatar_path = ? WHERE id = ?";

    /** SQL-запрос для получения всех пользователей. */
    private static final String SQL_FIND_ALL = 
            "SELECT * FROM users ORDER BY id";

    /** SQL-запрос для обновления роли пользователя. */
    private static final String SQL_UPDATE_ROLE = 
            "UPDATE users SET role = ? WHERE id = ?";

    /** SQL-запрос для обновления профиля пользователя. */
    private static final String SQL_UPDATE_PROFILE = 
            "UPDATE users SET " +
            "username = ?, " +
            "password = COALESCE(?, password), " +
            "age = COALESCE(?, age), " +
            "gender = COALESCE(?, gender), " +
            "city = COALESCE(?, city) " +
            "WHERE id = ?";

    /** SQL-запрос для увеличения счетчика входов. */
    private static final String SQL_INCREMENT_LOGIN = 
            "UPDATE users SET login_count = login_count + 1 WHERE id = ?";

    /** SQL-запрос для удаления пользователя по id. */
    private static final String SQL_DELETE_USER = 
            "DELETE FROM users WHERE id = ?";

    /**
     * Ищет пользователя по логину и паролю.
     *
     * @param username логин пользователя
     * @param password пароль пользователя
     * @return найденный объект {@link User} или {@code null}
     * @throws SQLException при ошибках работы с базой данных
     */
    public User findByCredentials(String username, String password) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_FIND_BY_CREDENTIALS)) {

            pstmt.setString(1, username);
            pstmt.setString(2, password);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapRowToUser(rs);
            }
        }
        return null;
    }

    /**
     * Сохраняет нового пользователя в базу данных.
     *
     * @param username   логин пользователя
     * @param password   пароль пользователя
     * @param role       роль пользователя
     * @param avatarPath путь к аватару
     * @param age        возраст
     * @param gender     пол
     * @param city       город
     * @throws SQLException при ошибках работы с базой данных
     */
    public void save(String username, String password, String role, 
                     String avatarPath, Integer age, String gender, 
                     String city) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_INSERT_USER)) {

            pstmt.setString(1, username);
            pstmt.setString(2, password);
            pstmt.setString(3, role);
            pstmt.setString(4, avatarPath);
            pstmt.setObject(5, age);
            pstmt.setString(6, gender);
            pstmt.setString(7, city);
            pstmt.executeUpdate();
        }
    }

    /**
     * Обновляет путь к аватару пользователя (по логину).
     *
     * @param username   логин пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatar(String username, String avatarPath) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_UPDATE_AVATAR)) {

            pstmt.setString(1, avatarPath);
            pstmt.setString(2, username);
            pstmt.executeUpdate();
        }
    }

    /**
     * Обновляет путь к аватару по идентификатору (для админа).
     *
     * @param id         идентификатор пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatarById(int id, String avatarPath) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_UPDATE_AVATAR_BY_ID)) {

            pstmt.setString(1, avatarPath);
            pstmt.setInt(2, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Получает список всех пользователей.
     *
     * @return список объектов {@link User}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<User> findAll() throws SQLException {
        List<User> users = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                users.add(mapRowToUser(rs));
            }
        }
        return users;
    }

    /**
     * Обновляет роль пользователя.
     *
     * @param id   идентификатор пользователя
     * @param role новая роль
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateRole(int id, String role) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_UPDATE_ROLE)) {

            pstmt.setString(1, role);
            pstmt.setInt(2, id);
            pstmt.executeUpdate();
        }
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
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateProfile(int id, String username, String password, 
                              Integer age, String gender, String city) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_UPDATE_PROFILE)) {

            pstmt.setString(1, username);
            pstmt.setString(2, password);
            pstmt.setObject(3, age);
            pstmt.setString(4, gender);
            pstmt.setString(5, city);
            pstmt.setInt(6, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Увеличивает счетчик входов пользователя на 1.
     *
     * @param id идентификатор пользователя
     * @throws SQLException при ошибках работы с базой данных
     */
    public void incrementLoginCount(int id) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_INCREMENT_LOGIN)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Удаляет пользователя из базы данных.
     *
     * @param id идентификатор пользователя
     * @throws SQLException при ошибках работы с базой данных
     */
    public void deleteById(int id) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_DELETE_USER)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Вспомогательный метод для преобразования строки в объект User.
     *
     * @param rs результат SQL-запроса
     * @return объект {@link User}
     * @throws SQLException при ошибках чтения данных
     */
    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        user.setRole(Role.valueOf(rs.getString("role")));
        user.setAvatarPath(rs.getString("avatar_path"));
        user.setAge(rs.getObject("age") != null 
                ? rs.getInt("age") 
                : null);
        user.setGender(rs.getString("gender"));
        user.setCity(rs.getString("city"));
        user.setLoginCount(rs.getInt("login_count"));
        return user;
    }
}