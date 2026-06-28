package dk.ek.workly.config;

import dk.ek.workly.model.Category;
import dk.ek.workly.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDefaultCategories(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() > 0) {
                return;
            }

            categoryRepository.saveAll(List.of(
                    category("Maler", "Indvendigt og udvendigt malerarbejde", "🎨"),
                    category("Tømrer", "Renovering, træarbejde og montering", "🪚"),
                    category("Elektriker", "Elinstallationer, lamper og fejlfinding", "⚡"),
                    category("VVS", "Vand, varme, bad og installationer", "🔧"),
                    category("Murer", "Murværk, fliser og facaderenovering", "🧱"),
                    category("Gartner", "Havearbejde, beskæring og vedligeholdelse", "🌿"),
                    category("Rengøring", "Privat og erhvervsmæssig rengøring", "🧹"),
                    category("Gulvlægger", "Nye gulve, slibning og behandling", "🪵")
            ));
        };
    }

    private Category category(String name, String description, String icon) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setActive(true);
        return category;
    }
}
