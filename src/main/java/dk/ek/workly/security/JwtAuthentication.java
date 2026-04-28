package dk.ek.workly.security;

import dk.ek.workly.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


public class JwtAuthentication extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthentication(JwtTokenProvider jwtTokenProvider,
                             CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 🔹 Extract Authorization header
            String header = request.getHeader("Authorization");

            // 🔹 No token → continue filter chain
            if (header == null || !header.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            // 🔹 Extract JWT token (remove "Bearer " prefix)
            String token = header.substring(7);

            // 🔹 Validate token format and signature
            if (!jwtTokenProvider.validateToken(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 🔹 Get email from token
            String email = jwtTokenProvider.getEmail(token);

            // 🔹 Load user details from database
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // 🔹 Create authentication token
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // 🔹 Set request details in authentication
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 🔹 Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        // 🔹 Continue filter chain
        filterChain.doFilter(request, response);
    }
}


