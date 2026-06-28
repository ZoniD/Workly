package dk.ek.workly.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "entrepreneurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Entrepreneur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 140)
    private String companyName;

    @Column(length = 2000)
    private String description;

    @Column(length = 30)
    private String phone;

    @Column(length = 180)
    private String email;

    @Column(nullable = false, length = 120)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private boolean approved = false;

    @Column(nullable = false)
    private double rating = 0.0;
}
