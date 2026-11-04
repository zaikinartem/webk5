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
    private static final String SQL_FIND_BY_CREDENTIALS = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    /** SQL-запрос для добавления нового пользователя. */
    private static final String SQL_INSERT_USER = "INSERT INTO users (username, password, role, avatar_path) VALUES (?, ?, ?, ?)";
    
    /** SQL-запрос для обновления пути к аватару пользователя. */
    private static final String SQL_UPDATE_AVATAR = "UPDATE users SET avatar_path = ? WHERE username = ?";
    
    /** SQL-запрос для получения списка всех пользователей. */
    private static final String SQL_FIND_ALL = "SELECT * FROM users ORDER BY id";
    
    /** SQL-запрос для обновления роли пользователя по его id. */
    private static final String SQL_UPDATE_ROLE = "UPDATE users SET role = ? WHERE id = ?";

    /**
     * Ищет пользователя по логину и паролю.
     *
     * @param username логин пользователя
     * @param password пароль пользователя
     * @return найденный объект {@link User} или {@code null}, если пользователь не найден
     * @throws SQLException при ошибках работы с базой данных
     */
    public User findByCredentials(String username, String password) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_FIND_BY_CREDENTIALS)) {
            
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
     * @param role       роль пользователя (в виде строки)
     * @param avatarPath путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void save(String username, String password, String role, String avatarPath) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_INSERT_USER)) {
            
            pstmt.setString(1, username);
            pstmt.setString(2, password);
            pstmt.setString(3, role);
            pstmt.setString(4, avatarPath);
            pstmt.executeUpdate();
        }
    }

    /**
     * Обновляет путь к аватару пользователя в базе данных.
     *
     * @param username   логин пользователя
     * @param avatarPath новый путь к аватару
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateAvatar(String username, String avatarPath) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_UPDATE_AVATAR)) {
            
            pstmt.setString(1, avatarPath);
            pstmt.setString(2, username);
            pstmt.executeUpdate();
        }
    }

    /**
     * Получает список всех пользователей системы.
     *
     * @return список объектов {@link User}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<User> findAll() throws SQLException {
        List<User> users = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                users.add(mapRowToUser(rs));
            }
        }
        return users;
    }

    /**
     * Обновляет роль пользователя в базе данных.
     *
     * @param id   идентификатор пользователя
     * @param role новая роль
     * @throws SQLException при ошибках работы с базой данных
     */
    public void updateRole(int id, String role) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_UPDATE_ROLE)) {
            
            pstmt.setString(1, role);
            pstmt.setInt(2, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Вспомогательный метод для преобразования строки ResultSet в объект User.
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
        return user;
    }
}