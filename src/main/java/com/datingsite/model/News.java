package com.datingsite.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Класс сущности, представляющий новость на портале.
 */
public class News implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Уникальный идентификатор новости. */
    private Integer id;

    /** Заголовок новости. */
    private String title;

    /** Текст (содержание) новости. */
    private String content;

    /** Логин автора новости. */
    private String author;

    /** Дата и время публикации. */
    private Timestamp createdAt;

    /**
     * Конструктор по умолчанию.
     */
    public News() {
        this.id = null;
        this.author = "";
        this.content = "";
        this.createdAt = null;
        this.title = "";
    }

    /**
     * Возвращает идентификатор новости.
     *
     * @return id
     */
    public Integer getId() {
        return id;
    }

    /**
     * Устанавливает идентификатор новости.
     *
     * @param id уникальный идентификатор
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Возвращает заголовок новости.
     *
     * @return title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Устанавливает заголовок новости.
     *
     * @param title заголовок
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Возвращает текст новости.
     *
     * @return content
     */
    public String getContent() {
        return content;
    }

    /**
     * Устанавливает текст новости.
     *
     * @param content текст
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Возвращает логин автора.
     *
     * @return author
     */
    public String getAuthor() {
        return author;
    }

    /**
     * Устанавливает логин автора.
     *
     * @param author логин
     */
    public void setAuthor(String author) {
        this.author = author;
    }

    /**
     * Возвращает дату публикации.
     *
     * @return createdAt
     */
    public Timestamp getCreatedAt() {
        return createdAt;
    }

    /**
     * Устанавливает дату публикации.
     *
     * @param createdAt дата и время
     */
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}