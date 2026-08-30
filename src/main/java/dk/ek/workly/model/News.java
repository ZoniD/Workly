package dk.ek.workly.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class News {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 180)
    private String title;
    @Column(length = 500)
    private String summary;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(length = 500)
    private String imageUrl;
    @Column(nullable = false)
    private boolean featured = false;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
    private NewsStatus status = NewsStatus.DRAFT;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @PrePersist void onCreate(){LocalDateTime now=LocalDateTime.now();createdAt=now;updatedAt=now;if(status==null)status=NewsStatus.DRAFT;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
}
