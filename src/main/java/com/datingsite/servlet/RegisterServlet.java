package com.datingsite.servlet;

import com.datingsite.model.Role;
import com.datingsite.model.User;
import com.datingsite.util.DatabaseConnection;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Сервлет для регистрации новых пользователей.
 */
@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {

    /** SQL-запрос для добавления нового пользователя. */
    private static final String SQL_INSERT = "INSERT INTO users (username, password, role, avatar_path) VALUES (?, ?, ?, ?)";
    
    /** Путь к аватару по умолчанию. */
    private static final String DEFAULT_AVATAR = "/uploads/default.jpg";

    /**
     * Обрабатывает POST-запрос для регистрации пользователя.
     * Роль всегда назначается как {@link Role#USER}.
     *
     * @param req  объект запроса
     * @param resp объект ответа
     * @throws IOException при ошибках ввода-вывода
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false, \"message\":\"Все поля обязательны для заполнения.\"}");
            out.flush();
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_INSERT)) {

            pstmt.setString(1, username.trim());
            pstmt.setString(2, password.trim());
            pstmt.setString(3, Role.USER.name()); // Всегда USER!
            pstmt.setString(4, DEFAULT_AVATAR);
            
            pstmt.executeUpdate();

            User user = new User();
            user.setUsername(username.trim());
            user.setRole(Role.USER);
            user.setAvatarPath(DEFAULT_AVATAR);

            HttpSession session = req.getSession(true);
            session.setAttribute("currentUser", user);

            out.print(String.format(
                    "{\"success\":true, \"username\":\"%s\", \"role\":\"%s\", \"avatarPath\":\"%s\"}",
                    user.getUsername(), user.getRole(), user.getAvatarPath()));
                    
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
            // Проверяем код ошибки дубликата (23505 для PostgreSQL)
            if ("23505".equals(e.getSQLState())) {
                out.print("{\"success\":false, \"message\":\"Пользователь с таким логином уже существует.\"}");
            } else {
                out.print("{\"success\":false, \"message\":\"Ошибка базы данных при регистрации.\"}");
                e.printStackTrace();
            }
        }
        out.flush();
    }
}