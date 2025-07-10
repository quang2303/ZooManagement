package com.quang.zoo.config;

import org.springframework.security.config.Customizer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
		.csrf(csrf -> csrf.disable())
		.authorizeHttpRequests(auth -> auth
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/animals").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
				.anyRequest().authenticated()
				)
		.formLogin(form -> form
				.loginProcessingUrl("/api/auth/login")
				.failureUrl("/login.html?error=true")
				.defaultSuccessUrl("/index.html", true)
				.permitAll()
				)
		.logout(logout -> logout
				.logoutUrl("/logout")
				.invalidateHttpSession(true)
                .deleteCookies("JSESSIONID").permitAll())
		.httpBasic(Customizer.withDefaults());
		
		return http.build();
	}
	
	@Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
	
	@Bean
	UserDetailsService userDetailsService(PasswordEncoder encoder) {
	    UserDetails admin = User.builder()
	        .username("admin")
	        .password(encoder.encode("123"))
	        .roles("ADMIN")
	        .build();

	    UserDetails user = User.builder()
	        .username("user")
	        .password(encoder.encode("123"))
	        .roles("USER")
	        .build();

	    return new InMemoryUserDetailsManager(admin, user);
	}

}

