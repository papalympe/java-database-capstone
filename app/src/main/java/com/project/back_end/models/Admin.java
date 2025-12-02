package com.project.back_end.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class Admin {

    // Primary key, auto-incremented
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Username field, cannot be null
    @NotNull(message = "username cannot be null")
    private String username;

    // Password field, cannot be null and write-only in JSON responses
    @NotNull(message = "password cannot be null")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // No-argument constructor required by JPA
    public Admin() {
    }

    // Parameterized constructor (optional, can be used for convenience)
    public Admin(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
