package com.smartcampus.config;

import com.smartcampus.entity.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
public class MongoConfig {

    /**
     * Custom converter that safely maps any stored role string to a Role enum.
     * If the stored value is unrecognised (e.g. a legacy "TECHNICIAN" role),
     * it falls back to Role.USER instead of throwing IllegalArgumentException.
     */
    @ReadingConverter
    static class StringToRoleConverter implements Converter<String, Role> {
        @Override
        public Role convert(String source) {
            try {
                return Role.valueOf(source);
            } catch (IllegalArgumentException e) {
                return Role.USER;
            }
        }
    }

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(new StringToRoleConverter()));
    }
}
