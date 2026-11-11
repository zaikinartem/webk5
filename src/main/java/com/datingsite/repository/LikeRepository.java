package com.datingsite.repository;

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
 * Слой доступа к данным (Data Access Object) для работы с таблицей likes.
 * Отвечает за добавление, удаление и получение лайков.
 */
@Repository
public class LikeRepository {

    /** SQL-запрос для добавления лайка. */
    private static final String SQL_INSERT_LIKE = 
            "INSERT INTO likes (from_user_id, to_user_id) VALUES (?, ?)";

    /** SQL-запрос для удаления лайка. */
    private static final String SQL_DELETE_LIKE = 
            "DELETE FROM likes WHERE from_user_id = ? AND to_user_id = ?";

    /** SQL-запрос для получения списка лайкнутых пользователей. */
    private static final String SQL_GET_LIKED_USERS = 
            "SELECT u.* FROM users u " +
            "JOIN likes l ON u.id = l.to_user_id " +
            "WHERE l.from_user_id = ? " +
            "ORDER BY l.created_at DESC";

    /**
     * Сохраняет лайк от одного пользователя другому.
     *
     * @param fromUserId идентификатор того, кто лайкает
     * @param toUserId   идентификатор того, кого лайкают
     * @throws SQLException при ошибках работы с базой данных
     */
    public void saveLike(int fromUserId, int toUserId) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_INSERT_LIKE)) {

            pstmt.setInt(1, fromUserId);
            pstmt.setInt(2, toUserId);
            pstmt.executeUpdate();
        }
    }

    /**
     * Удаляет лайк (дизлайк).
     *
     * @param fromUserId идентификатор того, кто ставил лайк
     * @param toUserId   идентификатор того, с кого снимают лайк
     * @throws SQLException при ошибках работы с базой данных
     */
    public void removeLike(int fromUserId, int toUserId) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_DELETE_LIKE)) {

            pstmt.setInt(1, fromUserId);
            pstmt.setInt(2, toUserId);
            pstmt.executeUpdate();
        }
    }

    /**
     * Получает список пользователей, которых лайкнул текущий пользователь.
     *
     * @param fromUserId идентификатор пользователя, чьи лайки мы ищем
     * @return список объектов {@link User}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<User> getLikedUsers(int fromUserId) throws SQLException {
        List<User> users = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_GET_LIKED_USERS)) {

            pstmt.setInt(1, fromUserId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setAvatarPath(rs.getString("avatar_path"));
                user.setAge(rs.getInt("age"));
                user.setGender(rs.getString("gender"));
                user.setCity(rs.getString("city"));
                users.add(user);
            }
        }
        return users;
    }
}