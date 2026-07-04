package dk.ek.workly.repository;

import dk.ek.workly.model.News;
import dk.ek.workly.model.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long> {

    List<News> findByStatusOrderByPublishedAtDesc(NewsStatus status);

    List<News> findAllByOrderByCreatedAtDesc();

    Optional<News> findByIdAndStatus(Long id, NewsStatus status);

    long countByStatus(NewsStatus status);
}
