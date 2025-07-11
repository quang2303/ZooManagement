package com.quang.zoo.exception;

import com.quang.zoo.entity.Species;

public class NotFoundException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	public NotFoundException(String message) {
	    super(message);
	}

	public NotFoundException(Species species) {
	    super("Don't have animal type " + species + " in the system.");
	}

	
	public NotFoundException() {
		super("Don't have lion in the system!");
	}
}
