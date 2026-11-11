package com.datingsite.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Утилитарный класс для управления подключением к базе данных PostgreSQL.
 */
public class DatabaseConnection {

    /** Строка подключения к базе данных с указанием схемы. */
    private static final String URL = 
            "jdbc:postgresql://localhost:5432/postgres?currentSchema=public";

    /** Имя пользователя базы данных. */
    private static final String USER = "postgres";

    /** Пароль пользователя базы данных. */
    private static final String PASSWORD = "28032007";

    /**
     * Статический блок инициализации.
     * Загружает драйвер JDBC для PostgreSQL при первом обращении к классу.
     */
    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * Приватный конструктор для предотвращения создания экземпляров.
     */
    private DatabaseConnection() {
    }

    /**
     * Создает и возвращает новое подключение к базе данных.
     *
     * @return объект {@link Connection} для работы с БД
     * @throws SQLException если не удалось установить соединение
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}