package dk.ek.workly.controller;
import dk.ek.workly.dto.adminDTO.NewsRequest;
import dk.ek.workly.dto.userDTO.NewsResponse;
import dk.ek.workly.dto.UpdateNewsStatusRequest;
import dk.ek.workly.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/admin/news")
public class AdminNewsController {
    private final NewsService newsService;
    public AdminNewsController(NewsService newsService){this.newsService=newsService;}
    @GetMapping public List<NewsResponse> getAll(){return newsService.getAllForAdmin();}
    @PostMapping public ResponseEntity<?> create(@RequestBody NewsRequest request, Authentication authentication){try{return ResponseEntity.status(HttpStatus.CREATED).body(newsService.create(request,authentication.getName()));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id,@RequestBody NewsRequest request){try{return ResponseEntity.ok(newsService.update(id,request));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @PatchMapping("/{id}/status") public ResponseEntity<?> updateStatus(@PathVariable Long id,@RequestBody UpdateNewsStatusRequest request){try{return ResponseEntity.ok(newsService.updateStatus(id,request.getStatus()));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
    @DeleteMapping("/{id}") public ResponseEntity<?> archive(@PathVariable Long id){try{return ResponseEntity.ok(newsService.archive(id));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}}
}
