package com.datingsite.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.io.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Слушатель жизненного цикла контекста для сохранения и загрузки счетчика посещений.
 */
@WebListener
public class VisitorCounterListener implements ServletContextListener {

    /** Имя файла для сохранения состояния счетчика. */
    private static final String COUNTER_FILE = "visitor_counter.txt";

    /** Атомарный счетчик посещений. */
    private static final AtomicInteger counter = new AtomicInteger(0);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        File file = new File(COUNTER_FILE);
        if (file.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                String line = reader.readLine();
                if (line != null) {
                    counter.set(Integer.parseInt(line.trim()));
                }
            } catch (Exception e) {
                counter.set(0);
            }
        }
        sce.getServletContext().setAttribute("visitorCounter", counter);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(COUNTER_FILE))) {
            writer.write(String.valueOf(counter.get()));
        } catch (IOException ignored) {
        }
    }

    /**
     * Увеличивает счетчик посещений на единицу.
     * @return новое значение счетчика
     */
    public static int incrementAndGet() {
        return counter.incrementAndGet();
    }

    /**
     * Возвращает текущее значение счетчика без его изменения.
     * @return текущее количество посещений
     */
    public static int getCounter() {
        return counter.get();
    }
}