package dk.ek.workly.service;

import dk.ek.workly.dto.adminDTO.NewsRequest;
import dk.ek.workly.dto.userDTO.NewsResponse;
import dk.ek.workly.model.News;
import dk.ek.workly.model.NewsStatus;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.NewsRepository;
import dk.ek.workly.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {

    private final NewsRepository newsRepository;
    private final UserRepository userRepository;

    public NewsService(
            NewsRepository newsRepository,
            UserRepository userRepository) {
        this.newsRepository = newsRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<NewsResponse> getPublishedNews() {
        return newsRepository.findByStatusOrderByPublishedAtDesc(NewsStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NewsResponse getPublishedNewsById(Long id) {
        News news = newsRepository.findByIdAndStatus(id, NewsStatus.PUBLISHED)
                .orElseThrow(() -> new IllegalArgumentException("Nyheden blev ikke fundet"));

        return toResponse(news);
    }

    @Transactional
    public List<NewsResponse> getAllForAdmin() {
        return newsRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NewsResponse create(
            NewsRequest request,
            String authenticatedEmail) {

        validate(request);

        User author = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Administratoren blev ikke fundet"));

        News news = new News();
        applyRequest(news, request);
        news.setStatus(NewsStatus.DRAFT);
        news.setAuthor(author);

        return toResponse(newsRepository.save(news));
    }

    @Transactional
    public NewsResponse update(Long id, NewsRequest request) {
        validate(request);

        News news = findNews(id);
        applyRequest(news, request);

        return toResponse(newsRepository.save(news));
    }

    @Transactional
    public NewsResponse updateStatus(Long id, NewsStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Vælg en gyldig status");
        }

        News news = findNews(id);
        news.setStatus(status);

        if (status == NewsStatus.PUBLISHED) {
            news.setPublishedAt(LocalDateTime.now());
        } else if (status == NewsStatus.DRAFT) {
            news.setPublishedAt(null);
        }

        return toResponse(newsRepository.save(news));
    }

    @Transactional
    public NewsResponse archive(Long id) {
        News news = findNews(id);
        news.setStatus(NewsStatus.ARCHIVED);
        return toResponse(newsRepository.save(news));
    }

    private News findNews(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nyheden blev ikke fundet"));
    }

    private void applyRequest(News news, NewsRequest request) {
        news.setTitle(request.getTitle().trim());
        news.setSummary(trimOrEmpty(request.getSummary()));
        news.setContent(request.getContent().trim());
        news.setImageUrl(trimOrEmpty(request.getImageUrl()));
        news.setFeatured(request.isFeatured());
    }

    private NewsResponse toResponse(News news) {
        return new NewsResponse(
                news.getId(),
                news.getTitle(),
                news.getSummary(),
                news.getContent(),
                news.getImageUrl(),
                news.isFeatured(),
                news.getStatus(),
                news.getAuthor().getName(),
                news.getCreatedAt(),
                news.getUpdatedAt(),
                news.getPublishedAt()
        );
    }

    private void validate(NewsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Nyhedsdata mangler");
        }
        if (isBlank(request.getTitle())) {
            throw new IllegalArgumentException("Titel skal udfyldes");
        }
        if (isBlank(request.getContent())) {
            throw new IllegalArgumentException("Nyhedstekst skal udfyldes");
        }
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
