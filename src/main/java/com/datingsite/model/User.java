package com.datingsite.model;

import java.io.Serializable;

/**
 * Класс сущности, представляющий пользователя системы.
 * Реализует интерфейс {@link Serializable} для сохранения в сессии.
 */
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Уникальный идентификатор пользователя в базе данных. */
    private Integer id;

    /** Логин пользователя (уникальный). */
    private String username;

    /** Пароль пользователя. */
    private String password;

    /** Роль пользователя в системе. */
    private Role role;

    /** Относительный путь к файлу аватара. */
    private String avatarPath;

    /** Возраст пользователя. */
    private Integer age;

    /** Пол пользователя. */
    private String gender;

    /** Город пользователя. */
    private String city;

    /** Количество входов пользователя на сайт. */
    private Integer loginCount;

    /**
     * Конструктор по умолчанию.
     */
    public User() {
        this.id = null;
        this.username = "";
        this.password = "";
        this.role = Role.USER;
        this.avatarPath = "";
        this.age = null;
        this.gender = "";
        this.city = "";
        this.loginCount = null;
    }

    /**
     * Возвращает идентификатор пользователя.
     * @return id
     */
    public Integer getId() { return id; }

    /**
     * Устанавливает идентификатор пользователя.
     * @param id уникальный идентификатор
     */
    public void setId(Integer id) { this.id = id; }

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

    /**
     * Возвращает возраст пользователя.
     * @return age
     */
    public Integer getAge() { return age; }

    /**
     * Устанавливает возраст пользователя.
     * @param age возраст
     */
    public void setAge(Integer age) { this.age = age; }

    /**
     * Возвращает пол пользователя.
     * @return gender
     */
    public String getGender() { return gender; }

    /**
     * Устанавливает пол пользователя.
     * @param gender пол
     */
    public void setGender(String gender) { this.gender = gender; }

    /**
     * Возвращает город пользователя.
     * @return city
     */
    public String getCity() { return city; }

    /**
     * Устанавливает город пользователя.
     * @param city город
     */
    public void setCity(String city) { this.city = city; }

    /**
     * Возвращает количество входов на сайт.
     * @return loginCount
     */
    public Integer getLoginCount() { return loginCount; }

    /**
     * Устанавливает количество входов на сайт.
     * @param loginCount количество входов
     */
    public void setLoginCount(Integer loginCount) { this.loginCount = loginCount; }
}