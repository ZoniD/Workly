const API_BASE = window.location.port === "8080"
    ? "/api"
    : "http://localhost:8080/api";

const state = {
    categories: [],
    professionals: [],
    selectedCategoryId: null,
    searchText: "",
    locationText: "",
    sortBy: "rating"
};

const elements = {
    categoryGrid: document.querySelector("#category-grid"),
    professionalGrid: document.querySelector("#professional-grid"),
    resultCount: document.querySelector("#result-count"),
    professionalCount: document.querySelector("#professional-count"),
    clearCategory: document.querySelector("#clear-category"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#search-input"),
    locationInput: document.querySelector("#location-input"),
    sortSelect: document.querySelector("#sort-select"),
    profileCategory: document.querySelector("#profile-category"),
    loginButton: document.querySelector("#login-button"),
    profileButton: document.querySelector("#profile-button"),
    ctaProfileButton: document.querySelector("#cta-profile-button"),
    logoutButton: document.querySelector("#logout-button"),
    userArea: document.querySelector("#user-area"),
    userName: document.querySelector("#user-name"),
    loginTab: document.querySelector("#login-tab"),
    registerTab: document.querySelector("#register-tab"),
    loginForm: document.querySelector("#login-form"),
    registerForm: document.querySelector("#register-form"),
    profileForm: document.querySelector("#profile-form"),
    toast: document.querySelector("#toast")
};

let toastTimer;

document.addEventListener("DOMContentLoaded", async () => {
    bindEvents();
    updateUserArea();
    await loadInitialData();
});

async function loadInitialData() {
    try {
        const [categories, professionals] = await Promise.all([
            apiRequest("/categories"),
            apiRequest("/entrepreneurs")
        ]);

        state.categories = categories;
        state.professionals = professionals;
        populateProfileCategories();
        renderCategories();
        renderProfessionals();
    } catch (error) {
        console.error(error);
        renderLoadError();
        showToast("Kunne ikke hente data fra backend. Kontrollér at Spring Boot kører på port 8080.", true);
    }
}

function bindEvents() {
    elements.searchForm.addEventListener("submit", event => {
        event.preventDefault();
        state.searchText = elements.searchInput.value.trim().toLowerCase();
        state.locationText = elements.locationInput.value.trim().toLowerCase();
        renderProfessionals();
        document.querySelector("#professionals").scrollIntoView({ behavior: "smooth" });
    });

    elements.sortSelect.addEventListener("change", event => {
        state.sortBy = event.target.value;
        renderProfessionals();
    });

    elements.clearCategory.addEventListener("click", () => {
        state.selectedCategoryId = null;
        elements.clearCategory.hidden = true;
        renderCategories();
        renderProfessionals();
    });

    elements.loginButton.addEventListener("click", () => openModal("auth-modal"));
    elements.profileButton.addEventListener("click", handleProfileButton);
    elements.ctaProfileButton.addEventListener("click", handleProfileButton);
    elements.logoutButton.addEventListener("click", logout);

    elements.loginTab.addEventListener("click", () => switchAuthView("login"));
    elements.registerTab.addEventListener("click", () => switchAuthView("register"));

    elements.loginForm.addEventListener("submit", handleLogin);
    elements.registerForm.addEventListener("submit", handleRegister);
    elements.profileForm.addEventListener("submit", handleCreateProfile);

    document.querySelectorAll("[data-close-modal]").forEach(element => {
        element.addEventListener("click", () => closeModal(element.dataset.closeModal));
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal.open").forEach(modal => closeModal(modal.id));
        }
    });
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = localStorage.getItem("worklyToken");
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(data?.message || "Der opstod en fejl");
    }

    return data;
}

function renderCategories() {
    if (!state.categories.length) {
        elements.categoryGrid.innerHTML = `
            <div class="empty-state">
                <span>🧰</span>
                <h3>Ingen kategorier endnu</h3>
                <p>Tilføj kategorier i databasen for at vise dem her.</p>
            </div>
        `;
        return;
    }

    elements.categoryGrid.innerHTML = state.categories.map(category => `
        <button
            class="category-card ${state.selectedCategoryId === category.id ? "active" : ""}"
            type="button"
            data-category-id="${category.id}">
            <span class="category-icon">${escapeHtml(category.icon || "🛠️")}</span>
            <span>
                <strong>${escapeHtml(category.name)}</strong>
                <small>${escapeHtml(category.description || "Find lokale fagfolk")}</small>
            </span>
        </button>
    `).join("");

    elements.categoryGrid.querySelectorAll("[data-category-id]").forEach(button => {
        button.addEventListener("click", () => {
            state.selectedCategoryId = Number(button.dataset.categoryId);
            elements.clearCategory.hidden = false;
            renderCategories();
            renderProfessionals();
            document.querySelector("#professionals").scrollIntoView({ behavior: "smooth" });
        });
    });
}

function renderProfessionals() {
    let professionals = [...state.professionals];

    if (state.selectedCategoryId !== null) {
        professionals = professionals.filter(
            professional => professional.categoryId === state.selectedCategoryId
        );
    }

    if (state.searchText) {
        professionals = professionals.filter(professional => {
            const searchableText = [
                professional.companyName,
                professional.categoryName,
                professional.description
            ].join(" ").toLowerCase();

            return searchableText.includes(state.searchText);
        });
    }

    if (state.locationText) {
        professionals = professionals.filter(professional =>
            (professional.location || "").toLowerCase().includes(state.locationText)
        );
    }

    professionals.sort((first, second) => {
        if (state.sortBy === "name") {
            return first.companyName.localeCompare(second.companyName, "da");
        }
        if (state.sortBy === "location") {
            return (first.location || "").localeCompare(second.location || "", "da");
        }
        return second.rating - first.rating;
    });

    elements.resultCount.textContent = `${professionals.length} ${professionals.length === 1 ? "fagperson" : "fagfolk"}`;
    elements.professionalCount.textContent = state.professionals.length;

    if (!professionals.length) {
        elements.professionalGrid.innerHTML = `
            <div class="empty-state">
                <span>🔎</span>
                <h3>Ingen profiler matcher din søgning</h3>
                <p>Prøv et andet fagområde eller et bredere område.</p>
            </div>
        `;
        return;
    }

    elements.professionalGrid.innerHTML = professionals.map(professional => {
        const initials = getInitials(professional.companyName);
        const ratingText = professional.rating > 0
            ? `★ ${professional.rating.toFixed(1)}`
            : "Ny profil";

        return `
            <article class="professional-card">
                <div class="professional-top">
                    <div class="avatar">${escapeHtml(initials)}</div>
                    <span class="rating-badge">${ratingText}</span>
                </div>
                <h3>${escapeHtml(professional.companyName)}</h3>
                <span class="professional-category">
                    ${escapeHtml(professional.categoryIcon || "🛠️")} ${escapeHtml(professional.categoryName)}
                </span>
                <p class="professional-description">
                    ${escapeHtml(professional.description || "Denne virksomhed har endnu ikke tilføjet en beskrivelse.")}
                </p>
                <div class="professional-meta">
                    <span>📍 ${escapeHtml(professional.location || "Område ikke angivet")}</span>
                    ${professional.phone ? `<span>☎ ${escapeHtml(professional.phone)}</span>` : ""}
                </div>
                <div class="professional-actions">
                    ${professional.phone
            ? `<a class="contact-primary" href="tel:${encodeURIComponent(professional.phone)}">Ring op</a>`
            : `<span class="contact-primary button" aria-disabled="true">Intet nummer</span>`}
                    ${professional.email
            ? `<a class="contact-secondary" href="mailto:${encodeURIComponent(professional.email)}">Send email</a>`
            : `<span class="contact-secondary button" aria-disabled="true">Ingen email</span>`}
                </div>
            </article>
        `;
    }).join("");
}

function renderLoadError() {
    elements.categoryGrid.innerHTML = `
        <div class="empty-state">
            <span>⚠️</span>
            <h3>Backend kunne ikke kontaktes</h3>
            <p>Start Spring Boot og genindlæs siden.</p>
        </div>
    `;
    elements.professionalGrid.innerHTML = elements.categoryGrid.innerHTML;
    elements.resultCount.textContent = "0 fagfolk";
}

function populateProfileCategories() {
    elements.profileCategory.innerHTML = `
        <option value="">Vælg fagområde</option>
        ${state.categories.map(category => `
            <option value="${category.id}">${escapeHtml(category.name)}</option>
        `).join("")}
    `;
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: formData.get("email"),
                password: formData.get("password")
            })
        });

        saveSession(response);
        closeModal("auth-modal");
        event.currentTarget.reset();
        showToast(response.message);
    } catch (error) {
        showToast(error.message, true);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
        const response = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password")
            })
        });

        saveSession(response);
        closeModal("auth-modal");
        event.currentTarget.reset();
        showToast(response.message);
    } catch (error) {
        showToast(error.message, true);
    }
}

async function handleCreateProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
        await apiRequest("/entrepreneurs", {
            method: "POST",
            body: JSON.stringify({
                companyName: formData.get("companyName"),
                description: formData.get("description"),
                phone: formData.get("phone"),
                email: formData.get("email"),
                location: formData.get("location"),
                categoryId: Number(formData.get("categoryId"))
            })
        });

        closeModal("profile-modal");
        event.currentTarget.reset();
        showToast("Profilen er sendt til godkendelse.");
    } catch (error) {
        if (error.message.toLowerCase().includes("authentication") || error.message.includes("403")) {
            logout(false);
            openModal("auth-modal");
        }
        showToast(error.message, true);
    }
}

function handleProfileButton() {
    if (!localStorage.getItem("worklyToken")) {
        switchAuthView("register");
        openModal("auth-modal");
        showToast("Opret eller log ind på en bruger først.");
        return;
    }

    openModal("profile-modal");
}

function saveSession(response) {
    localStorage.setItem("worklyToken", response.token);
    localStorage.setItem("worklyUser", JSON.stringify({
        name: response.name,
        email: response.email,
        role: response.role
    }));
    updateUserArea();
}

function logout(showMessage = true) {
    localStorage.removeItem("worklyToken");
    localStorage.removeItem("worklyUser");
    updateUserArea();

    if (showMessage) {
        showToast("Du er logget ud.");
    }
}

function updateUserArea() {
    const user = getStoredUser();
    const loggedIn = Boolean(user && localStorage.getItem("worklyToken"));

    elements.userArea.hidden = !loggedIn;
    elements.loginButton.hidden = loggedIn;
    elements.userName.textContent = loggedIn ? user.name : "";
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("worklyUser"));
    } catch {
        return null;
    }
}

function switchAuthView(view) {
    const showLogin = view === "login";
    elements.loginForm.hidden = !showLogin;
    elements.registerForm.hidden = showLogin;
    elements.loginTab.classList.toggle("active", showLogin);
    elements.registerTab.classList.toggle("active", !showLogin);
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.open")) {
        document.body.classList.remove("modal-open");
    }
}

function showToast(message, isError = false) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle("error", isError);
    elements.toast.classList.add("show");

    toastTimer = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 3600);
}

function getInitials(name) {
    return (name || "W")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
