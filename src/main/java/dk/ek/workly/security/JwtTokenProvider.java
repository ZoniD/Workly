package dk.ek.workly.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final String jwtSecret;
    private final long jwtExpiration;

    public JwtTokenProvider(@Value("${jwt.secret}") String jwtSecret, @Value("${jwt.expiration}") long jwtExpiration) {
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + jwtExpiration);
        return Jwts.builder().subject(email).claim("role", role).issuedAt(now).expiration(expiresAt)
                .signWith(getSigningKey()).compact();
    }

    public boolean validateToken(String token) {
        try { getAllClaims(token); return true; }
        catch (JwtException | IllegalArgumentException exception) { return false; }
    }

    public String getEmail(String token) { return getAllClaims(token).getSubject(); }

    private Claims getAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
