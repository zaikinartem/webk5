package com.datingsite.servlet;

import com.datingsite.listener.VisitorCounterListener;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Сервлет для получения информации о статусе сервера и количестве посещений.
 */
@WebServlet("/api/info")
public class InfoServlet extends HttpServlet {

    /** Формат даты и времени для вывода. */
    private static final String DATE_FORMAT = "dd.MM.yyyy HH:mm:ss";

    /** Ключ сессии для отслеживания уникального визита. */
    private static final String VISITED_KEY = "visited";

    /** Кодировка ответа. */
    private static final String CONTENT_TYPE = "application/json;charset=UTF-8";

    /**
     * Обрабатывает GET-запрос. Увеличивает счетчик только при первом визите
     * пользователя в рамках текущей сессии.
     *
     * @param req  объект запроса
     * @param resp объект ответа
     * @throws IOException при ошибках ввода-вывода
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType(CONTENT_TYPE);

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute(VISITED_KEY) == null) {
            VisitorCounterListener.incrementAndGet();
            req.getSession(true).setAttribute(VISITED_KEY, true);
        }

        int visitCount = VisitorCounterListener.getCounter();
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATE_FORMAT));

        PrintWriter out = resp.getWriter();
        out.print(String.format("{\"dateTime\":\"%s\", \"visitCount\":%d}", currentTime, visitCount));
        out.flush();
    }
}