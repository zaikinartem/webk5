package com.datingsite.model;

import java.io.Serializable;

/**
 * Класс сущности, представляющий пользователя системы.
 * Реализует интерфейс {@link Serializable} для сохранения в сессии Tomcat.
 */
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Уникальный идентификатор пользователя в базе данных. */
    private Long id;

    /** Логин пользователя (уникальный). */
    private String username;

    /** Пароль пользователя. */
    private String password;

    /** Роль пользователя в системе. */
    private Role role;

    /** Относительный путь к файлу аватара. */
    private String avatarPath;

    /**
     * Конструктор по умолчанию.
     */
    public User() {
    }

    /**
     * Конструктор с параметрами для полной инициализации сущности.
     *
     * @param id         уникальный идентификатор
     * @param username   логин
     * @param password   пароль
     * @param role       роль пользователя
     * @param avatarPath путь к аватару
     */
    public User(Long id, String username, String password, Role role, String avatarPath) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.avatarPath = avatarPath;
    }

    /**
     * Возвращает идентификатор пользователя.
     * @return id
     */
    public Long getId() { return id; }

    /**
     * Устанавливает идентификатор пользователя.
     * @param id уникальный идентификатор
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Возвращает логин пользователя.
     * @return username
     */
    public String getUsername() { return username; }

    /**
     * Устанавливает логин пользователя.
     * @param username логин
     */
    public void setUsername(String username) { this.username = username; }

    /**
     * Возвращает пароль пользователя.
     * @return password
     */
    public String getPassword() { return password; }

    /**
     * Устанавливает пароль пользователя.
     * @param password пароль
     */
    public void setPassword(String password) { this.password = password; }

    /**
     * Возвращает роль пользователя.
     * @return role
     */
    public Role getRole() { return role; }

    /**
     * Устанавливает роль пользователя.
     * @param role роль
     */
    public void setRole(Role role) { this.role = role; }

    /**
     * Возвращает путь к аватару.
     * @return avatarPath
     */
    public String getAvatarPath() { return avatarPath; }

    /**
     * Устанавливает путь к аватару.
     * @param avatarPath путь к аватару
     */
    public void setAvatarPath(String avatarPath) { this.avatarPath = avatarPath; }
}