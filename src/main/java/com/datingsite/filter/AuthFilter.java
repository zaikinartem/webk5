package com.datingsite.filter;

import com.datingsite.model.Role;
import com.datingsite.model.User;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

// ✅ Теперь фильтр реально защищает нужные пути
@WebFilter(urlPatterns = {"/api/profile/*", "/api/admin/*", "/api/moderator/*"})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpSession session = req.getSession(false);

        if (session == null || session.getAttribute("currentUser") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"Access Denied\"}");
            return;
        }

        User user = (User) session.getAttribute("currentUser");
        String uri = req.getRequestURI();

        if (uri.contains("/admin") && user.getRole() != Role.ADMIN) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\":\"Forbidden: Admin access required\"}");
            return;
        }

        if (uri.contains("/moderator") && user.getRole() != Role.MODERATOR && user.getRole() != Role.ADMIN) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\":\"Forbidden: Moderator access required\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}