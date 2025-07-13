package com.quang.zoo.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnimalCountPerDayResponse {
	private LocalDate date;
	private int count;
	
	/**
	* When returning to FE instead of calling getDate(),Jackson will call this function.
	* This function will format date 
	*/
	@JsonProperty("date")
	public String getDateFormatted() {
		return date.format(DateTimeFormatter.ofPattern("dd-MM"));
	}
}
