package dk.ek.workly.controller;
import dk.ek.workly.dto.adminDTO.CategoryResponse;
import dk.ek.workly.service.CategoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService){this.categoryService=categoryService;}
    @GetMapping public List<CategoryResponse> getCategories(){return categoryService.getActiveCategories();}
}
