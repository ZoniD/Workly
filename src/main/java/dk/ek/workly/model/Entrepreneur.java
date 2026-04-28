package dk.ek.workly.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Entrepreneur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private User user;

    private String companyName;

    private String description;

    private String phone;

    private String email;

    private String location;

    private Category category;

    private boolean approved;

    private double rating;
}
