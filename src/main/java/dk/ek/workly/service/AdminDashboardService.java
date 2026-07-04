package dk.ek.workly.service;

import dk.ek.workly.dto.adminDTO.AdminDashboardResponse;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.model.NewsStatus;
import dk.ek.workly.repository.EntrepreneurRepository;
import dk.ek.workly.repository.NewsRepository;
import dk.ek.workly.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final EntrepreneurRepository entrepreneurRepository;
    private final UserRepository userRepository;
    private final NewsRepository newsRepository;

    public AdminDashboardService(
            EntrepreneurRepository entrepreneurRepository,
            UserRepository userRepository,
            NewsRepository newsRepository
    ) {
        this.entrepreneurRepository = entrepreneurRepository;
        this.userRepository = userRepository;
        this.newsRepository = newsRepository;
    }

    public AdminDashboardResponse getDashboard() {

        long pendingEntrepreneurs =
                entrepreneurRepository.countByStatus(
                        EntrepreneurStatus.PENDING
                );

        long approvedEntrepreneurs =
                entrepreneurRepository.countByStatus(
                        EntrepreneurStatus.APPROVED
                );

        long activeEntrepreneurs =
                entrepreneurRepository.countByStatusAndActiveTrue(
                        EntrepreneurStatus.APPROVED
                );

        long registeredUsers =
                userRepository.count();

        long publishedNews =
                newsRepository.countByStatus(
                        NewsStatus.PUBLISHED
                );

        return new AdminDashboardResponse(
                pendingEntrepreneurs,
                approvedEntrepreneurs,
                activeEntrepreneurs,
                registeredUsers,
                publishedNews
        );
    }
}