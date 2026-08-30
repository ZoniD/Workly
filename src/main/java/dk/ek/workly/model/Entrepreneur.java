package dk.ek.workly.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "entrepreneurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Entrepreneur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @ManyToOne @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private EntrepreneurStatus status = EntrepreneurStatus.PENDING;
    @Column(nullable = false)
    private boolean active = true;
    @Column(nullable = false)
    private boolean availableForWork = true;
    @Column(nullable = false)
    private double rating = 0.0;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now; updatedAt = now;
        if (status == null) status = EntrepreneurStatus.PENDING;
    }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
