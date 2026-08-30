package dk.ek.workly.config;

import dk.ek.workly.model.Category;
import dk.ek.workly.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Order(1)
    CommandLineRunner createDefaultCategories(
            CategoryRepository categoryRepository) {

        return args -> {

            List<CategoryData> categories = List.of(

                    new CategoryData(
                            "Maler",
                            "Indvendigt og udvendigt malerarbejde",
                            "🎨"
                    ),

                    new CategoryData(
                            "Tømrer",
                            "Renovering, træarbejde og montering",
                            "🪚"
                    ),

                    new CategoryData(
                            "Elektriker",
                            "Elinstallationer, lamper og fejlfinding",
                            "⚡"
                    ),

                    new CategoryData(
                            "VVS",
                            "Vand, varme, bad og installationer",
                            "🔧"
                    ),

                    new CategoryData(
                            "Murer",
                            "Murværk, fliser og facaderenovering",
                            "🧱"
                    ),

                    new CategoryData(
                            "Gartner",
                            "Havearbejde, beskæring og vedligeholdelse",
                            "🌿"
                    ),

                    new CategoryData(
                            "Rengøring",
                            "Privat og erhvervsmæssig rengøring",
                            "🧹"
                    ),

                    new CategoryData(
                            "Gulvlægger",
                            "Nye gulve, slibning og behandling",
                            "🪵"
                    )
            );

            for (CategoryData data : categories) {

                Category category = categoryRepository
                        .findByNameIgnoreCase(data.name())
                        .orElseGet(Category::new);

                category.setName(data.name());
                category.setDescription(data.description());
                category.setIcon(data.icon());
                category.setActive(true);

                categoryRepository.save(category);
            }

            System.out.println(
                    "Alle Workly-kategorier er klar."
            );
        };
    }

    private record CategoryData(
            String name,
            String description,
            String icon) {
    }
}