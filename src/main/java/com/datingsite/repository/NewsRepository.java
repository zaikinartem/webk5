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
 * Слой доступа к данным (Data Access Object) для таблицы news.
 */
@Repository
public class NewsRepository {

    /** SQL-запрос для получения всех новостей. */
    private static final String SQL_FIND_ALL = 
            "SELECT * FROM news ORDER BY created_at DESC";

    /** SQL-запрос для получения новостей с пагинацией. */
    private static final String SQL_FIND_PAGINATED = 
            "SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?";

    /** SQL-запрос для получения общего количества новостей. */
    private static final String SQL_COUNT_ALL = 
            "SELECT COUNT(*) FROM news";

    /** SQL-запрос для добавления новой новости. */
    private static final String SQL_INSERT = 
            "INSERT INTO news (title, content, author) VALUES (?, ?, ?)";

    /** SQL-запрос для обновления новости. */
    private static final String SQL_UPDATE = 
            "UPDATE news SET title = ?, content = ? WHERE id = ?";

    /** SQL-запрос для проверки существования по заголовку. */
    private static final String SQL_CHECK_TITLE = 
            "SELECT COUNT(*) FROM news WHERE title = ?";

    /** Проверка уникальности заголовка при редактировании. */
    private static final String SQL_CHECK_TITLE_EXCEPT_ID =
            "SELECT COUNT(*) FROM news WHERE title = ? AND id <> ?";

    /** SQL-запрос для проверки существования по тексту. */
    private static final String SQL_CHECK_CONTENT = 
            "SELECT COUNT(*) FROM news WHERE content = ?";

    /** Проверка уникальности текста при редактировании. */
    private static final String SQL_CHECK_CONTENT_EXCEPT_ID =
            "SELECT COUNT(*) FROM news WHERE content = ? AND id <> ?";

    /** SQL-запрос для проверки существования по id. */
    private static final String SQL_CHECK_ID = 
            "SELECT COUNT(*) FROM news WHERE id = ?";

    /** SQL-запрос для удаления новости. */
    private static final String SQL_DELETE = 
            "DELETE FROM news WHERE id = ?";

    /**
     * Получает список всех новостей.
     *
     * @return список объектов {@link News}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<News> findAll() throws SQLException {
        List<News> newsList = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                newsList.add(mapRowToNews(rs));
            }
        }
        return newsList;
    }

    /**
     * Получает список новостей с пагинацией.
     *
     * @param page номер страницы (начиная с 0)
     * @param size количество новостей на странице
     * @return список объектов {@link News}
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<News> findPaginated(int page, int size) throws SQLException {
        List<News> newsList = new ArrayList<>();
        int offset = page * size;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_FIND_PAGINATED)) {

            pstmt.setInt(1, size);
            pstmt.setInt(2, offset);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                newsList.add(mapRowToNews(rs));
            }
        }
        return newsList;
    }

    /**
     * Получает общее количество новостей.
     *
     * @return количество новостей
     * @throws SQLException при ошибках работы с базой данных
     */
    public int countAll() throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_COUNT_ALL);
             ResultSet rs = pstmt.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }

    /**
     * Сохраняет новую новость.
     *
     * @param title   заголовок
     * @param content текст
     * @param author  логин автора
     * @throws SQLException при ошибках работы с базой данных
     */
    public void save(String title, String content, String author) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_INSERT)) {

            pstmt.setString(1, title);
            pstmt.setString(2, content);
            pstmt.setString(3, author);
            pstmt.executeUpdate();
        }
    }

    /**
     * Обновляет существующую новость.
     *
     * @param id      идентификатор новости
     * @param title   новый заголовок
     * @param content новый текст
     * @throws SQLException при ошибках работы с базой данных
     */
    public void update(int id, String title, String content) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_UPDATE)) {

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
        return existsByField(SQL_CHECK_TITLE, title);
    }

    /**
     * Проверяет заголовок у других новостей.
     *
     * @param title заголовок
     * @param excludedId ID редактируемой новости
     * @return true, если такой заголовок уже занят
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsByTitleExceptId(String title, int excludedId)
            throws SQLException {
        return existsByFieldAndId(
                SQL_CHECK_TITLE_EXCEPT_ID, title, excludedId
        );
    }

    /**
     * Проверяет, существует ли новость с таким текстом.
     *
     * @param content текст новости
     * @return true, если такой текст уже есть
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsByContent(String content) throws SQLException {
        return existsByField(SQL_CHECK_CONTENT, content);
    }

    /**
     * Проверяет текст у других новостей.
     *
     * @param content текст новости
     * @param excludedId ID редактируемой новости
     * @return true, если такой текст уже занят
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsByContentExceptId(String content, int excludedId)
            throws SQLException {
        return existsByFieldAndId(
                SQL_CHECK_CONTENT_EXCEPT_ID, content, excludedId
        );
    }

    /**
     * Проверяет, существует ли новость с таким идентификатором.
     *
     * @param id идентификатор новости
     * @return true, если новость найдена
     * @throws SQLException при ошибках работы с базой данных
     */
    public boolean existsById(int id) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_CHECK_ID)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }

    /**
     * Удаляет новость по идентификатору.
     *
     * @param id идентификатор новости
     * @throws SQLException при ошибках работы с базой данных
     */
    public void deleteById(int id) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = 
                     conn.prepareStatement(SQL_DELETE)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        }
    }

    /**
     * Вспомогательный метод для проверки существования по строке.
     */
    private boolean existsByField(String sql, String field) 
            throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, field);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }

    /**
     * Проверяет поле у записей, кроме указанной.
     *
     * @param sql SQL-запрос проверки
     * @param field значение поля
     * @param excludedId идентификатор исключаемой записи
     * @return true, если значение найдено у другой записи
     * @throws SQLException при ошибках работы с базой данных
     */
    private boolean existsByFieldAndId(
            String sql, String field, int excludedId
    ) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, field);
            pstmt.setInt(2, excludedId);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        }
    }

    /**
     * Преобразует строку ResultSet в объект News.
     */
    private News mapRowToNews(ResultSet rs) throws SQLException {
        News news = new News();
        news.setId(rs.getInt("id"));
        news.setTitle(rs.getString("title"));
        news.setContent(rs.getString("content"));
        news.setAuthor(rs.getString("author"));
        news.setCreatedAt(rs.getTimestamp("created_at"));
        return news;
    }
}