package com.datingsite.repository;

import com.datingsite.model.News;
import com.datingsite.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Слой доступа к данным (Data Access Object) для работы с таблицей news.
 */
@Repository
public class NewsRepository {

    /** SQL-запрос для получения всех новостей (сортировка по дате - сначала новые). */
    private static final String SQL_FIND_ALL = "SELECT * FROM news ORDER BY created_at DESC";
    
    /** SQL-запрос для добавления новой новости. */
    private static final String SQL_INSERT = "INSERT INTO news (title, content, author) VALUES (?, ?, ?)";
    
    /** SQL-запрос для обновления существующей новости. */
    private static final String SQL_UPDATE = "UPDATE news SET title = ?, content = ? WHERE id = ?";
    
    /** SQL-запрос для проверки существования новости с таким же заголовком. */
    private static final String SQL_CHECK_TITLE = "SELECT COUNT(*) FROM news WHERE title = ?";
    
    /** SQL-запрос для проверки существования новости с таким же текстом. */
    private static final String SQL_CHECK_CONTENT = "SELECT COUNT(*) FROM news WHERE content = ?";

    /**
     * Получает список всех новостей.
     *
     * @return список объектов {@link News}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<News> findAll() throws SQLException {
        List<News> newsList = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                News news = new News();
                news.setId(rs.getInt("id"));
                news.setTitle(rs.getString("title"));
                news.setContent(rs.getString("content"));
                news.setAuthor(rs.getString("author"));
                news.setCreatedAt(rs.getTimestamp("created_at"));
                newsList.add(news);
            }
        }
        return newsList;
    }

    /**
     * Сохраняет новую новость в базу данных.
     *
     * @param title   заголовок
     * @param content текст новости
     * @param author  логин автора
     * @throws SQLException при ошибках работы с базой данных
     */
    public void save(String title, String content, String author) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_INSERT)) {
            
            pstmt.setString(1, title);
            pstmt.setString(2, content);
            pstmt.setString(3, author);
            pstmt.executeUpdate();
        }
    }

    /**
     * Обновляет заголовок и текст существующей новости.
     *
     * @param id      идентификатор новости
     * @param title   новый заголовок
     * @param content новый текст
     * @throws SQLException при ошибках работы с базой данных
     */
    public void update(int id, String title, String content) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_UPDATE)) {
            
            pstmt.setString(1, title);
            pstmt.setString(2, content);
            pstmt.setInt(3, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Проверяет, существует ли новость с таким заголовком.
     *
     * @param title заголовок
     * @return true, если заголовок уже занят
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsByTitle(String title) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_CHECK_TITLE)) {
            pstmt.setString(1, title);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }

    /**
     * Проверяет, существует ли новость с таким текстом.
     *
     * @param content текст новости
     * @return true, если такой текст уже есть
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsByContent(String content) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_CHECK_CONTENT)) {
            pstmt.setString(1, content);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }
}