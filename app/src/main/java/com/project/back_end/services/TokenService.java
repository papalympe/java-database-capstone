package com.project.back_end.services;

import com.project.back_end.models.Admin;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class TokenService {

    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey signingKey;

    public TokenService(AdminRepository adminRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository) {
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    // -----------------------------------------------------
    // Initialize signing key after bean creation
    // -----------------------------------------------------
    @PostConstruct
    public void init() {
        this.signingKey = createSigningKey();
    }

    // -----------------------------------------------------
    // Generate JWT token for a user identifier
    // -----------------------------------------------------
    public String generateToken(String identifier) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 7L * 24 * 60 * 60 * 1000); // 7 days

        return Jwts.builder()
                .setSubject(identifier)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // -----------------------------------------------------
    // Extract identifier (subject) from JWT token
    // -----------------------------------------------------
    public String extractIdentifier(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            return null; // Invalid token
        }
    }

    // -----------------------------------------------------
    // Validate token for a specific user type
    // -----------------------------------------------------
    public boolean validateToken(String token, String user) {
        String identifier = extractIdentifier(token);
        if (identifier == null) return false;

        return switch (user.toLowerCase()) {
            case "admin" -> adminRepository.findByUsername(identifier) != null;
            case "doctor" -> doctorRepository.findByEmail(identifier) != null;
            case "patient" -> patientRepository.findByEmail(identifier).isPresent();
            default -> false;
        };
    }

    // -----------------------------------------------------
    // Returns the signing key used for JWT signing & validation
    // -----------------------------------------------------
    private SecretKey getSigningKey() {
        return this.signingKey;
    }

    // -----------------------------------------------------
    // Explicit creation of HMAC signing key from secret
    // -----------------------------------------------------
    private SecretKey createSigningKey() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 characters long for HMAC-SHA security"
            );
        }

        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
