package dk.ek.workly.repository;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.EntrepreneurStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface EntrepreneurRepository extends JpaRepository<Entrepreneur, Long> {
    List<Entrepreneur> findByStatusAndActiveTrueOrderByRatingDesc(EntrepreneurStatus status);
    List<Entrepreneur> findByStatusAndActiveTrueAndCategory_IdOrderByRatingDesc(EntrepreneurStatus status, Long categoryId);
    Optional<Entrepreneur> findByUser_Id(Long userId);
    boolean existsByUser_Id(Long userId);
    Optional<Entrepreneur> findByUser_EmailIgnoreCase(String email);
    List<Entrepreneur> findAllByOrderByCreatedAtDesc();
    List<Entrepreneur> findByStatusOrderByCreatedAtDesc(EntrepreneurStatus status);
    long countByStatus(EntrepreneurStatus status);
    long countByStatusAndActiveTrue(EntrepreneurStatus status);
}
