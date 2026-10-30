package com.datingsite.filter;

import com.datingsite.model.Role;
import com.datingsite.model.User;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Фильтр безопасности для проверки наличия сессии и прав доступа пользователей.
 * Перехватывает запросы к защищенным ресурсам (профиль, админка, модерация).
 */
@WebFilter(urlPatterns = {"/api/profile/*", "/api/admin/*", "/api/moderator/*"})
public class AuthFilter implements Filter {

    /** Ключ сессии для хранения текущего пользователя. */
    private static final String SESSION_USER_KEY = "currentUser";
    
    /** Путь к ресурсам администратора. */
    private static final String ADMIN_PATH = "/admin";
    
    /** Путь к ресурсам модератора. */
    private static final String MODERATOR_PATH = "/moderator";
    
    /** Кодировка ответа. */
    private static final String CONTENT_TYPE = "application/json;charset=UTF-8";

    /**
     * Инициализация фильтра.
     *
     * @param filterConfig конфигурация фильтра
     */
    @Override
    public void init(FilterConfig filterConfig) {
        // Инициализация не требуется
    }

    /**
     * Проверяет сессию пользователя и его роль перед доступом к защищенным ресурсам.
     *
     * @param request  запрос
     * @param response ответ
     * @param chain    цепь фильтров
     * @throws IOException      исключение ввода-вывода
     * @throws ServletException исключение сервлета
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        resp.setContentType(CONTENT_TYPE);

        HttpSession session = req.getSession(false);

        if (session == null || session.getAttribute(SESSION_USER_KEY) == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"Access Denied\"}");
            return;
        }

        User user = (User) session.getAttribute(SESSION_USER_KEY);
        String uri = req.getRequestURI();

        if (uri.contains(ADMIN_PATH) && user.getRole() != Role.ADMIN) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\":\"Forbidden: Admin access required\"}");
            return;
        }

        if (uri.contains(MODERATOR_PATH) && user.getRole() != Role.MODERATOR && user.getRole() != Role.ADMIN) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\":\"Forbidden: Moderator access required\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    /**
     * Уничтожение фильтра.
     */
    @Override
    public void destroy() {
        // Освобождение ресурсов не требуется
    }
}