package com.clariq.backend.dto;

import java.util.UUID;

public class LoginResponse {

    private UUID userId;
    private String name;
    private String loginId;
    private String role;
    private String message;

    public LoginResponse(UUID userId, String name, String loginId, String role, String message) {
        this.userId = userId;
        this.name = name;
        this.loginId = loginId;
        this.role = role;
        this.message = message;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}
