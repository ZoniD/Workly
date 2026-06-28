package dk.ek.workly.repository;

import dk.ek.workly.model.Entrepreneur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EntrepreneurRepository extends JpaRepository<Entrepreneur, Long> {
    List<Entrepreneur> findByApprovedTrueOrderByRatingDesc();
    List<Entrepreneur> findByApprovedTrueAndCategoryIdOrderByRatingDesc(Long categoryId);
    Optional<Entrepreneur> findByUserId(Long userId);
}
