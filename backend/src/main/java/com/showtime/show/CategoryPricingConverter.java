package com.showtime.show;


import com.showtime.seat.SeatType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.Map;

@Converter
public class CategoryPricingConverter implements AttributeConverter<Map<SeatType, BigDecimal>, String> {
    private static final ObjectMapper MAPPER = JsonMapper.builder().build();
    @Override
    public String convertToDatabaseColumn(Map<SeatType, BigDecimal> attribute) {
        if (attribute == null) {
            return null;
        }
        return MAPPER.writeValueAsString(attribute);
    }

    @Override
    public Map<SeatType, BigDecimal> convertToEntityAttribute(String dbData) {
        if(dbData == null) {
            return null;
        }
        return MAPPER.readValue(dbData, MAPPER.getTypeFactory()
        .constructMapType(Map.class, String.class, BigDecimal.class));
    }
}
