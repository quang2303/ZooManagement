package com.quang.zoo.mappers;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.quang.zoo.dto.AnimalCountPerDayResponse;

@Mapper
public interface AnimalMapper {
	List<AnimalCountPerDayResponse> countAnimalsByDay(Map<String, Object> param);
}
