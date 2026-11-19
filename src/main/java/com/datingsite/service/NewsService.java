package com.datingsite.service;

import com.datingsite.model.News;
import com.datingsite.repository.NewsRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Сервисный слой для управления новостями.
 */
@Service
public class NewsService {

    /** Размер страницы по умолчанию. */
    private static final int DEFAULT_PAGE_SIZE = 5;

    /** Репозиторий для работы с данными новостей. */
    private final NewsRepository newsRepository;

    /**
     * Конструктор сервиса с внедрением зависимости.
     *
     * @param newsRepository репозиторий новостей
     */
    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    /**
     * Получает список всех новостей (без пагинации).
     *
     * @return список новостей
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<News> getAllNews() throws SQLException {
        return newsRepository.findAll();
    }

    /**
     * Получает страницу новостей с метаданными для пагинации.
     *
     * @param page номер страницы (начиная с 0)
     * @param size количество новостей на странице
     * @return карта с новостями, номером страницы и общим количеством
     * @throws SQLException при ошибках работы с базой данных
     */
    public Map<String, Object> getNewsPage(int page, int size) 
            throws SQLException {
        if (size <= 0) {
            size = DEFAULT_PAGE_SIZE;
        }
        if (page < 0) {
            page = 0;
        }

        List<News> newsList = newsRepository.findPaginated(page, size);
        int totalCount = newsRepository.countAll();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> response = new HashMap<>();
        response.put("news", newsList);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalItems", totalCount);

        return response;
    }

    /**
     * Создает новую новость с проверкой входных данных и уникальности.
     *
     * @param title   заголовок
     * @param content текст
     * @param author  логин автора
     * @throws IllegalArgumentException если поля пусты или уже есть
     * @throws SQLException             при ошибках работы с базой данных
     */
    public void createNews(String title, String content, String author) 
            throws SQLException {
        if (title == null || title.trim().isEmpty() 
                || content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Заголовок и текст новости не могут быть пустыми."
            );
        }

        if (newsRepository.existsByTitle(title.trim())) {
            throw new IllegalArgumentException(
                    "Новость с таким заголовком уже существует."
            );
        }
        if (newsRepository.existsByContent(content.trim())) {
            throw new IllegalArgumentException(
                    "Новость с таким текстом уже существует."
            );
        }

        newsRepository.save(title.trim(), content.trim(), author);
    }

    /**
     * Редактирует новость с проверкой данных и уникальности.
     *
     * @param id      идентификатор новости
     * @param title   новый заголовок
     * @param content новый текст
     * @throws IllegalArgumentException если поля пусты или уже есть
     * @throws SQLException             при ошибках работы с базой данных
     */
    public void updateNews(int id, String title, String content) 
            throws SQLException {
        if (!newsRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Новость с таким идентификатором не найдена."
            );
        }

        if (title == null || title.trim().isEmpty() 
                || content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Заголовок и текст новости не могут быть пустыми."
            );
        }

        if (newsRepository.existsByTitleExceptId(title.trim(), id)) {
            throw new IllegalArgumentException(
                    "Новость с таким заголовком уже существует."
            );
        }
        if (newsRepository.existsByContentExceptId(content.trim(), id)) {
            throw new IllegalArgumentException(
                    "Новость с таким текстом уже существует."
            );
        }

        newsRepository.update(id, title.trim(), content.trim());
    }

    /**
     * Удаляет новость по идентификатору.
     *
     * @param id идентификатор новости
     * @throws SQLException при ошибках работы с базой данных
     */
    public void deleteNews(int id) throws SQLException {
        newsRepository.deleteById(id);
    }
}