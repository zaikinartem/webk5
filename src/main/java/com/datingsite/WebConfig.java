package com.datingsite;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Конфигурация веб-слоя для отдачи статических файлов.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Настраивает пути для отдачи загруженных пользователем файлов (аватарок).
     *
     * @param registry реестр для регистрации обработчиков ресурсов
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}