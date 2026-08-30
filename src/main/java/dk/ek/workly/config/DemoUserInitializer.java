package dk.ek.workly.config;

import dk.ek.workly.model.Category;
import dk.ek.workly.model.Entrepreneur;
import dk.ek.workly.model.EntrepreneurStatus;
import dk.ek.workly.model.Role;
import dk.ek.workly.model.User;
import dk.ek.workly.repository.CategoryRepository;
import dk.ek.workly.repository.EntrepreneurRepository;
import dk.ek.workly.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@ConditionalOnProperty(name = "workly.demo-users.enabled", havingValue = "true")
public class DemoUserInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@gmail.com";
    private static final String ENTREPRENEUR_EMAIL = "bruger@gmail.com";
    private static final String DEMO_PASSWORD = "12345678";

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EntrepreneurRepository entrepreneurRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
                               EntrepreneurRepository entrepreneurRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.entrepreneurRepository = entrepreneurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        createOrUpdateAdmin();
        createOrUpdateDemoEntrepreneurs();
    }

    private void createOrUpdateAdmin() {

        User admin = userRepository
                .findByEmailIgnoreCase(ADMIN_EMAIL)
                .orElseGet(User::new);

        admin.setName("Workly Admin");
        admin.setEmail(ADMIN_EMAIL);

        /*
         * Passwordet nulstilles til 12345678 ved hver opstart.
         * Dette bør kun bruges under udvikling.
         */
        admin.setPassword(
                passwordEncoder.encode(DEMO_PASSWORD)
        );

        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
    }

    private void createOrUpdateDemoEntrepreneurs() {

        List<DemoEntrepreneurData> demoEntrepreneurs = List.of(

                /*
                 * Malere
                 */
                demo(
                        "Jonas Madsen",
                        "Madsens Malerservice",
                        "maler1@example.com",
                        "12 34 56 01",
                        "København",
                        "Maler",
                        "Indvendigt og udvendigt malerarbejde til private boliger.",
                        4.7
                ),
                demo(
                        "Sofie Andersen",
                        "Sofies Malerfirma",
                        "maler2@example.com",
                        "12 34 56 02",
                        "Frederiksberg",
                        "Maler",
                        "Maling, spartling, tapetsering og farverådgivning.",
                        4.5
                ),
                demo(
                        "Emil Larsen",
                        "Nordisk Farve",
                        "maler3@example.com",
                        "12 34 56 03",
                        "Roskilde",
                        "Maler",
                        "Malerarbejde til både private og mindre virksomheder.",
                        4.8
                ),
                demo(
                        "Nadia Hassan",
                        "Nadia Malerservice",
                        "maler4@example.com",
                        "12 34 56 04",
                        "Ballerup",
                        "Maler",
                        "Grundigt malerarbejde med fokus på kvalitet og detaljer.",
                        4.6
                ),
                demo(
                        "Martin Jensen",
                        "MJ Maler og Design",
                        "maler5@example.com",
                        "12 34 56 05",
                        "Hvidovre",
                        "Maler",
                        "Maling og kreative farveløsninger til boligen.",
                        4.4
                ),

                /*
                 * Tømrere
                 */
                demo(
                        "Mikkel Sørensen",
                        "Sørensens Tømrerfirma",
                        "toemrer1@example.com",
                        "12 34 57 01",
                        "København",
                        "Tømrer",
                        "Renovering, døre, vinduer og træterrasser.",
                        4.8
                ),
                demo(
                        "Frederik Nielsen",
                        "FN Træ og Byg",
                        "toemrer2@example.com",
                        "12 34 57 02",
                        "Glostrup",
                        "Tømrer",
                        "Montering, reparationer og mindre tilbygninger.",
                        4.5
                ),
                demo(
                        "Alexander Hansen",
                        "Hansen Byg",
                        "toemrer3@example.com",
                        "12 34 57 03",
                        "Lyngby",
                        "Tømrer",
                        "Specialbyggede skabe, køkkener og træmøbler.",
                        4.7
                ),
                demo(
                        "Sarah Petersen",
                        "SP Tømrer og Montage",
                        "toemrer4@example.com",
                        "12 34 57 04",
                        "Amager",
                        "Tømrer",
                        "Indvendig renovering og professionelt montagearbejde.",
                        4.6
                ),
                demo(
                        "Yusuf Demir",
                        "Demir Tømrer",
                        "toemrer5@example.com",
                        "12 34 57 05",
                        "Taastrup",
                        "Tømrer",
                        "Gulve, lofter, skillevægge og udendørs træarbejde.",
                        4.9
                ),

                /*
                 * Elektrikere
                 */
                demo(
                        "Andreas Holm",
                        "Holm Elservice",
                        "elektriker1@example.com",
                        "12 34 58 01",
                        "København",
                        "Elektriker",
                        "Lamper, stikkontakter, elinstallationer og fejlfinding.",
                        4.9
                ),
                demo(
                        "Amir Rahimi",
                        "AR Elteknik",
                        "elektriker2@example.com",
                        "12 34 58 02",
                        "Herlev",
                        "Elektriker",
                        "Moderne elinstallationer og energibesparende løsninger.",
                        4.7
                ),
                demo(
                        "Louise Møller",
                        "Møller El og Energi",
                        "elektriker3@example.com",
                        "12 34 58 03",
                        "Gentofte",
                        "Elektriker",
                        "Eltjek, lampeopsætning og installation af eludstyr.",
                        4.8
                ),
                demo(
                        "Thomas Kristensen",
                        "TK Elektrik",
                        "elektriker4@example.com",
                        "12 34 58 04",
                        "Rødovre",
                        "Elektriker",
                        "Elservice til private boliger og mindre virksomheder.",
                        4.5
                ),
                demo(
                        "Rasmus Lund",
                        "Lund Elservice",
                        "elektriker5@example.com",
                        "12 34 58 05",
                        "Valby",
                        "Elektriker",
                        "Hurtig hjælp til mindre elopgaver og fejlfinding.",
                        4.3
                ),

                /*
                 * VVS
                 */
                demo(
                        "Peter Rasmussen",
                        "Rasmussen VVS",
                        "vvs1@example.com",
                        "12 34 59 01",
                        "København",
                        "VVS",
                        "Vand, varme, radiatorer og badeværelsesinstallationer.",
                        4.8
                ),
                demo(
                        "Mohammed Ali",
                        "MA VVS Service",
                        "vvs2@example.com",
                        "12 34 59 02",
                        "Brøndby",
                        "VVS",
                        "Reparation af vandhaner, toiletter og varmesystemer.",
                        4.6
                ),
                demo(
                        "Christian Poulsen",
                        "CP Varme og VVS",
                        "vvs3@example.com",
                        "12 34 59 03",
                        "Hillerød",
                        "VVS",
                        "Varmesystemer, gulvvarme og energiforbedringer.",
                        4.9
                ),
                demo(
                        "Henrik Johansen",
                        "HJ Installation",
                        "vvs4@example.com",
                        "12 34 59 04",
                        "Roskilde",
                        "VVS",
                        "Installation og renovering af badeværelser.",
                        4.5
                ),
                demo(
                        "Daniel Ahmed",
                        "DA VVS Teknik",
                        "vvs5@example.com",
                        "12 34 59 05",
                        "Ishøj",
                        "VVS",
                        "Service, fejlfinding og mindre akutte VVS-opgaver.",
                        4.7
                ),

                /*
                 * Murere
                 */
                demo(
                        "Lars Pedersen",
                        "Pedersens Murerfirma",
                        "murer1@example.com",
                        "12 34 60 01",
                        "København",
                        "Murer",
                        "Murværk, reparationer og renovering af facader.",
                        4.7
                ),
                demo(
                        "Simon Kjær",
                        "Kjær Murer og Fliser",
                        "murer2@example.com",
                        "12 34 60 02",
                        "Frederiksberg",
                        "Murer",
                        "Flisearbejde, badeværelser og mindre mureropgaver.",
                        4.8
                ),
                demo(
                        "Mustafa Kaya",
                        "Kaya Murerservice",
                        "murer3@example.com",
                        "12 34 60 03",
                        "Albertslund",
                        "Murer",
                        "Renovering, pudsning og reparation af murværk.",
                        4.5
                ),
                demo(
                        "Oliver Thomsen",
                        "OT Facade og Murer",
                        "murer4@example.com",
                        "12 34 60 04",
                        "Køge",
                        "Murer",
                        "Facaderenovering og udvendigt murværk.",
                        4.6
                ),
                demo(
                        "Camilla Friis",
                        "Friis Fliser og Murer",
                        "murer5@example.com",
                        "12 34 60 05",
                        "Greve",
                        "Murer",
                        "Fliser, fuger og mindre badeværelsesprojekter.",
                        4.9
                ),

                /*
                 * Gartnere
                 */
                demo(
                        "Mads Eriksen",
                        "Eriksens Haveservice",
                        "gartner1@example.com",
                        "12 34 61 01",
                        "København",
                        "Gartner",
                        "Græsslåning, beskæring og almindelig havevedligeholdelse.",
                        4.6
                ),
                demo(
                        "Julie Brandt",
                        "Julies Grønne Haver",
                        "gartner2@example.com",
                        "12 34 61 02",
                        "Lyngby",
                        "Gartner",
                        "Haveplanlægning, plantevalg og vedligeholdelse.",
                        4.8
                ),
                demo(
                        "Kasper Mortensen",
                        "KM Haveservice",
                        "gartner3@example.com",
                        "12 34 61 03",
                        "Ballerup",
                        "Gartner",
                        "Hækklipning, græsplæner og oprydning i haven.",
                        4.5
                ),
                demo(
                        "Ali Mahmoud",
                        "AM Have og Anlæg",
                        "gartner4@example.com",
                        "12 34 61 04",
                        "Hvidovre",
                        "Gartner",
                        "Haveanlæg, vedligeholdelse og mindre belægningsopgaver.",
                        4.7
                ),
                demo(
                        "Emma Skov",
                        "Skov Havedesign",
                        "gartner5@example.com",
                        "12 34 61 05",
                        "Roskilde",
                        "Gartner",
                        "Design og etablering af hyggelige og funktionelle haver.",
                        4.9
                ),

                /*
                 * Rengøring
                 */
                demo(
                        "Anna Nielsen",
                        "Anna Rengøring",
                        "rengoering1@example.com",
                        "12 34 62 01",
                        "København",
                        "Rengøring",
                        "Fast privat rengøring, hovedrengøring og flytterengøring.",
                        4.8
                ),
                demo(
                        "Fatima Osman",
                        "FO Rent Hjem",
                        "rengoering2@example.com",
                        "12 34 62 02",
                        "Amager",
                        "Rengøring",
                        "Grundig rengøring af private boliger og lejligheder.",
                        4.7
                ),
                demo(
                        "Maria Jensen",
                        "MJ Rengøringsservice",
                        "rengoering3@example.com",
                        "12 34 62 03",
                        "Frederiksberg",
                        "Rengøring",
                        "Rengøring til private og mindre virksomheder.",
                        4.5
                ),
                demo(
                        "Aisha Ahmed",
                        "Aisha Clean",
                        "rengoering4@example.com",
                        "12 34 62 04",
                        "Taastrup",
                        "Rengøring",
                        "Pålidelig og fleksibel rengøringshjælp.",
                        4.9
                ),
                demo(
                        "Helena Sørensen",
                        "HS Erhvervsrengøring",
                        "rengoering5@example.com",
                        "12 34 62 05",
                        "Glostrup",
                        "Rengøring",
                        "Rengøring af kontorer, klinikker og mindre butikker.",
                        4.6
                ),

                /*
                 * Gulvlæggere
                 */
                demo(
                        "Nikolaj Larsen",
                        "Larsens Gulvservice",
                        "gulv1@example.com",
                        "12 34 63 01",
                        "København",
                        "Gulvlægger",
                        "Nye trægulve, gulvslibning og efterbehandling.",
                        4.8
                ),
                demo(
                        "Benjamin Olsen",
                        "BO Gulve",
                        "gulv2@example.com",
                        "12 34 63 02",
                        "Rødovre",
                        "Gulvlægger",
                        "Montering af laminat, vinyl og parketgulve.",
                        4.6
                ),
                demo(
                        "Mathias Jensen",
                        "MJ Gulv og Finish",
                        "gulv3@example.com",
                        "12 34 63 03",
                        "Valby",
                        "Gulvlægger",
                        "Slibning og behandling af ældre trægulve.",
                        4.9
                ),
                demo(
                        "Ahmad Saleh",
                        "Saleh Gulvservice",
                        "gulv4@example.com",
                        "12 34 63 04",
                        "Brøndby",
                        "Gulvlægger",
                        "Montering og reparation af forskellige gulvtyper.",
                        4.5
                ),
                demo(
                        "Caroline Holm",
                        "Holm Gulvdesign",
                        "gulv5@example.com",
                        "12 34 63 05",
                        "Hellerup",
                        "Gulvlægger",
                        "Rådgivning, montering og efterbehandling af gulve.",
                        4.7
                )
        );

        for (DemoEntrepreneurData data : demoEntrepreneurs) {
            createOrUpdateEntrepreneur(data);
        }
    }

    private void createOrUpdateEntrepreneur(
            DemoEntrepreneurData data) {

        User user = userRepository
                .findByEmailIgnoreCase(data.email())
                .orElseGet(User::new);

        user.setName(data.name());
        user.setEmail(data.email());

        /*
         * Alle demo-fagpersoner får adgangskoden 12345678.
         */
        user.setPassword(
                passwordEncoder.encode(DEMO_PASSWORD)
        );

        user.setRole(Role.ENTREPRENEUR);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        Category category = categoryRepository
                .findByNameIgnoreCase(data.categoryName())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Kategorien findes ikke: "
                                        + data.categoryName()
                        )
                );

        Entrepreneur entrepreneur = entrepreneurRepository
                .findByUser_Id(savedUser.getId())
                .orElseGet(Entrepreneur::new);

        entrepreneur.setUser(savedUser);
        entrepreneur.setCompanyName(data.companyName());
        entrepreneur.setDescription(data.description());
        entrepreneur.setPhone(data.phone());
        entrepreneur.setEmail(data.email());
        entrepreneur.setLocation(data.location());
        entrepreneur.setCategory(category);

        /*
         * Profilen er godkendt og kan bruge fagpersonportalen.
         */
        entrepreneur.setStatus(
                EntrepreneurStatus.APPROVED
        );

        /*
         * Profilen vises på Worklys forside og kategorisider.
         */
        entrepreneur.setActive(true);

        /*
         * Fagpersonen tager imod nye opgaver.
         */
        entrepreneur.setAvailableForWork(true);

        entrepreneur.setRating(data.rating());

        entrepreneurRepository.save(entrepreneur);
    }

    private DemoEntrepreneurData demo(
            String name,
            String companyName,
            String email,
            String phone,
            String location,
            String categoryName,
            String description,
            double rating) {

        return new DemoEntrepreneurData(
                name,
                companyName,
                email,
                phone,
                location,
                categoryName,
                description,
                rating
        );
    }

    private record DemoEntrepreneurData(
            String name,
            String companyName,
            String email,
            String phone,
            String location,
            String categoryName,
            String description,
            double rating) {
    }

    private Category findOrCreateCategory() {
        return categoryRepository.findByNameIgnoreCase("Elektriker").orElseGet(() -> {
            Category category = new Category();
            category.setName("Elektriker");
            category.setDescription("Hjælp til installationer, elarbejde og fejlfinding.");
            category.setIcon("⚡");
            category.setActive(true);
            return categoryRepository.save(category);
        });
    }
}
