package com.smartcampus.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Inspect Authorization header to see if a Bearer token is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token (or invalid format), pass to next filter. 
            // If the route was secured, Spring Security will block it later.
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract Bearer token (strip out the "Bearer " prefix)
        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException e) {
            // Token is expired, malformed, or invalid — return 401 so the frontend clears it
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token is invalid or expired.\"}");
            return;
        }

        // 3. Prevent redundant lookups if the context is already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 4. Load the user from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 5. Validate the token mathematically
            if (jwtService.isTokenValid(jwt, userDetails)) {
                
                // 6. Create the authentication object representing the logged-in user
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                
                // Add standard web details (IP address, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 7. Push the authentication into the SecurityContextHolder so the REST API knows who the user is
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // Pass the request cleanly down the filter chain
        filterChain.doFilter(request, response);
    }
}
