# Validation notes

- `admin.js`, `app.js`, and `entrepreneur.js` passed `node --check`.
- `index.html`, `admin.html`, and `entrepreneur.html` were parsed successfully.
- The project contains the reconstructed Java/backend structure from the current `ZoniD/Workly` main branch plus the redesigned frontend.
- A full Maven dependency build could not be executed inside the artifact sandbox because the sandbox cannot resolve Maven Central. Run `mvnw.cmd spring-boot:run` or `./mvnw spring-boot:run` on a normal internet-connected development machine.
