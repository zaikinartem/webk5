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
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Сервлет для аутентификации пользователей, проверки сессии и выхода из
 * системы.
 */
@WebServlet("/api/auth")
public class AuthServlet extends HttpServlet {

    /**
     * SQL-запрос для поиска пользователя по логину и паролю.
     */
    private static final String SQL_LOGIN = "SELECT * FROM users WHERE username = ? AND password = ?";

    /**
     * Путь к аватару по умолчанию.
     */
    private static final String DEFAULT_AVATAR = "/uploads/default.jpg";

    /**
     * Обрабатывает POST-запрос для входа в систему.
     *
     * @param req объект запроса
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
            out.print("{\"success\":false, \"message\":\"Логин и пароль обязательны для заполнения.\"}");
            out.flush();
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection(); PreparedStatement pstmt = conn.prepareStatement(SQL_LOGIN)) {

            pstmt.setString(1, username);
            pstmt.setString(2, password);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("password"));
                user.setRole(Role.valueOf(rs.getString("role")));
                user.setAvatarPath(rs.getString("avatar_path"));

                HttpSession session = req.getSession(true);
                session.setAttribute("currentUser", user);

                out.print(String.format(
                        "{\"success\":true, \"username\":\"%s\", \"role\":\"%s\", \"avatarPath\":\"%s\"}",
                        user.getUsername(), user.getRole(), user.getAvatarPath()));
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"success\":false, \"message\":\"Неверный логин или пароль.\"}");
            }
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false, \"message\":\"Ошибка базы данных.\"}");
            e.printStackTrace();
        }
        out.flush();
    }

    /**
     * Обрабатывает GET-запрос для проверки текущей сессии.
     *
     * @param req объект запроса
     * @param resp объект ответа
     * @throws IOException при ошибках ввода-вывода
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        HttpSession session = req.getSession(false);
        PrintWriter out = resp.getWriter();

        if (session != null && session.getAttribute("currentUser") != null) {
            User user = (User) session.getAttribute("currentUser");
            String avatar = user.getAvatarPath() != null ? user.getAvatarPath() : DEFAULT_AVATAR;
            out.print(String.format(
                    "{\"authenticated\":true, \"username\":\"%s\", \"role\":\"%s\", \"avatarPath\":\"%s\"}",
                    user.getUsername(), user.getRole(), avatar));
        } else {
            out.print("{\"authenticated\":false}");
        }
        out.flush();
    }

    /**
     * Обрабатывает DELETE-запрос для выхода из системы (уничтожения сессии).
     *
     * @param req объект запроса
     * @param resp объект ответа
     * @throws IOException при ошибках ввода-вывода
     */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().print("{\"success\":true}");
    }
}
