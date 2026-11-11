package com.datingsite.service;

import com.datingsite.model.News;
import com.datingsite.repository.NewsRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

/**
 * Сервисный слой для управления новостями.
 */
@Service
public class NewsService {

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
     * Получает список всех новостей.
     *
     * @return список новостей
     * @throws SQLException при ошибках работы с базой данных
     */
    public List<News> getAllNews() throws SQLException {
        return newsRepository.findAll();
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