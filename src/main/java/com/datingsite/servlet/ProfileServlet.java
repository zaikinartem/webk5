package com.datingsite.servlet;

import com.datingsite.model.User;
import com.datingsite.util.DatabaseConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Сервлет для управления личным кабинетом и загрузки фотографий профиля.
 */
@WebServlet("/api/profile/upload")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2,
        maxFileSize = 1024 * 1024 * 10,
        maxRequestSize = 1024 * 1024 * 50
)
public class ProfileServlet extends HttpServlet {

    /** Директория для сохранения загруженных файлов. */
    private static final String UPLOAD_DIR = "uploads";
    
    /** SQL-запрос для обновления пути к аватару в базе данных. */
    private static final String SQL_UPDATE_AVATAR = "UPDATE users SET avatar_path = ? WHERE username = ?";

    /**
     * Обрабатывает POST-запрос для загрузки файла изображения на сервер.
     * Выполняет проверку типа файла и сохраняет его, если проверка пройдена.
     *
     * @param req  объект запроса
     * @param resp объект ответа
     * @throws ServletException при ошибках сервлета
     * @throws IOException      при ошибках ввода-вывода
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        HttpSession session = req.getSession(false);
        PrintWriter out = resp.getWriter();

        if (session == null || session.getAttribute("currentUser") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Unauthorized\"}");
            out.flush();
            return;
        }

        User user = (User) session.getAttribute("currentUser");
        Part filePart = req.getPart("file");

        if (filePart == null || filePart.getSize() == 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Файл не выбран или пуст.\"}");
            out.flush();
            return;
        }

        String contentType = filePart.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Разрешена загрузка только изображений.\"}");
            out.flush();
            return;
        }

        String fileName = System.currentTimeMillis() + "_" + filePart.getSubmittedFileName();
        String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIR;
        File uploadDir = new File(uploadPath);
        
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        filePart.write(uploadPath + File.separator + fileName);
        String avatarUrl = "/" + UPLOAD_DIR + "/" + fileName;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(SQL_UPDATE_AVATAR)) {
             
            pstmt.setString(1, avatarUrl);
            pstmt.setString(2, user.getUsername());
            pstmt.executeUpdate();
            
            user.setAvatarPath(avatarUrl);
            session.setAttribute("currentUser", user);

            out.print(String.format("{\"success\":true, \"avatarPath\":\"%s\"}", avatarUrl));
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Ошибка при обновлении данных в БД\"}");
            e.printStackTrace();
        }
        out.flush();
    }
}