package dk.ek.workly.controller;
import dk.ek.workly.dto.userDTO.NewsResponse;
import dk.ek.workly.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsService newsService;
    public NewsController(NewsService newsService){this.newsService=newsService;}
    @GetMapping public List<NewsResponse> getPublishedNews(){return newsService.getPublishedNews();}
    @GetMapping("/{id}") public ResponseEntity<?> getPublishedNewsById(@PathVariable Long id){try{return ResponseEntity.ok(newsService.getPublishedNewsById(id));}catch(IllegalArgumentException e){return ResponseEntity.notFound().build();}}
}
