const API_BASE =
    window.location.port === "8080"
        ? "/api"
        : "http://localhost:8080/api";


const state = {
    categories: [],
    professionals: [],
    news: [],
    selectedCategoryId: null,
    searchText: "",
    locationText: "",
    sortBy: "rating"
};


const elements = {
    categoryGrid: document.querySelector("#category-grid"),
    professionalGrid: document.querySelector("#professional-grid"),
    newsGrid: document.querySelector("#news-grid"),

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

    adminDashboardButton:
        document.querySelector("#admin-dashboard-button"),

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


// ==================================================
// INITIALISERING
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {
    bindEvents();
    updateUserArea();
    await loadInitialData();
});


async function loadInitialData() {
    await loadCategories();
    await loadProfessionals();
    await loadNews();

    populateProfileCategories();
    renderCategories();
    renderProfessionals();
    renderNews();
}


async function loadCategories() {
    try {
        const response = await apiRequest(
            "/categories",
            {
                auth: false
            }
        );

        state.categories = toArray(response);

    } catch (error) {
        console.error(
            "Kunne ikke hente kategorier:",
            error
        );

        state.categories = [];

        showToast(
            `Kategorier kunne ikke hentes: ${error.message}`,
            true
        );
    }
}


async function loadProfessionals() {
    try {
        const response = await apiRequest(
            "/entrepreneurs",
            {
                auth: false
            }
        );

        state.professionals = toArray(response);

    } catch (error) {
        console.error(
            "Kunne ikke hente fagfolk:",
            error
        );

        state.professionals = [];

        showToast(
            `Fagfolk kunne ikke hentes: ${error.message}`,
            true
        );
    }
}


async function loadNews() {
    try {
        const response = await apiRequest(
            "/news",
            {
                auth: false
            }
        );

        state.news = toArray(response);

    } catch (error) {
        console.error(
            "Kunne ikke hente nyheder:",
            error
        );

        state.news = [];
    }
}


// ==================================================
// EVENTS
// ==================================================

function bindEvents() {
    elements.searchForm?.addEventListener(
        "submit",
        handleSearch
    );

    elements.sortSelect?.addEventListener(
        "change",
        event => {
            state.sortBy = event.target.value;
            renderProfessionals();
        }
    );

    elements.clearCategory?.addEventListener(
        "click",
        () => {
            state.selectedCategoryId = null;
            elements.clearCategory.hidden = true;

            renderCategories();
            renderProfessionals();
        }
    );

    elements.loginButton?.addEventListener(
        "click",
        () => openModal("auth-modal")
    );

    elements.profileButton?.addEventListener(
        "click",
        handleProfileButton
    );

    elements.ctaProfileButton?.addEventListener(
        "click",
        handleProfileButton
    );

    elements.logoutButton?.addEventListener(
        "click",
        () => logout(true)
    );

    elements.loginTab?.addEventListener(
        "click",
        () => switchAuthView("login")
    );

    elements.registerTab?.addEventListener(
        "click",
        () => switchAuthView("register")
    );

    elements.loginForm?.addEventListener(
        "submit",
        handleLogin
    );

    elements.registerForm?.addEventListener(
        "submit",
        handleRegister
    );

    elements.profileForm?.addEventListener(
        "submit",
        handleCreateProfile
    );

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(element => {
            element.addEventListener(
                "click",
                () => {
                    closeModal(
                        element.dataset.closeModal
                    );
                }
            );
        });

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                document
                    .querySelectorAll(".modal.open")
                    .forEach(modal => {
                        closeModal(modal.id);
                    });
            }
        }
    );
}


function handleSearch(event) {
    event.preventDefault();

    state.searchText =
        elements.searchInput
            ?.value
            .trim()
            .toLowerCase() || "";

    state.locationText =
        elements.locationInput
            ?.value
            .trim()
            .toLowerCase() || "";

    renderProfessionals();

    document
        .querySelector("#professionals")
        ?.scrollIntoView({
            behavior: "smooth"
        });
}


// ==================================================
// API
// ==================================================

async function apiRequest(path, options = {}) {
    const {
        auth = true,
        headers: customHeaders = {},
        ...fetchOptions
    } = options;

    const headers = {
        Accept: "application/json",
        ...customHeaders
    };

    if (
        fetchOptions.body &&
        !headers["Content-Type"]
    ) {
        headers["Content-Type"] =
            "application/json";
    }

    if (auth) {
        const token =
            localStorage.getItem("worklyToken");

        if (token) {
            headers.Authorization =
                `Bearer ${token}`;
        }
    }

    const response = await fetch(
        `${API_BASE}${path}`,
        {
            ...fetchOptions,
            headers
        }
    );

    const responseText =
        await response.text();

    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = {
                message: responseText
            };
        }
    }

    if (!response.ok) {
        throw new Error(
            `${path} gav status ${response.status}: ` +
            `${data?.message ||
            response.statusText ||
            "Ukendt fejl"}`
        );
    }

    return data;
}


// ==================================================
// KATEGORIER
// ==================================================

function renderCategories() {
    if (!elements.categoryGrid) {
        return;
    }

    if (!state.categories.length) {
        elements.categoryGrid.innerHTML = `
            <div class="empty-state">
                <span>🧰</span>

                <h3>
                    Ingen kategorier endnu
                </h3>

                <p>
                    Der blev ikke fundet nogen kategorier.
                </p>
            </div>
        `;

        return;
    }

    elements.categoryGrid.innerHTML =
        state.categories
            .map(category => `
                <button
                    class="category-card ${
                state.selectedCategoryId ===
                Number(category.id)
                    ? "active"
                    : ""
            }"
                    type="button"
                    data-category-id="${category.id}"
                >
                    <span class="category-icon">
                        ${escapeHtml(
                category.icon || "🛠️"
            )}
                    </span>

                    <span>
                        <strong>
                            ${escapeHtml(category.name)}
                        </strong>

                        <small>
                            ${escapeHtml(
                category.description ||
                "Find lokale fagfolk"
            )}
                        </small>
                    </span>
                </button>
            `)
            .join("");

    elements.categoryGrid
        .querySelectorAll("[data-category-id]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    state.selectedCategoryId =
                        Number(
                            button.dataset.categoryId
                        );

                    if (elements.clearCategory) {
                        elements.clearCategory.hidden =
                            false;
                    }

                    renderCategories();
                    renderProfessionals();

                    document
                        .querySelector("#professionals")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });
                }
            );
        });
}


function populateProfileCategories() {
    if (!elements.profileCategory) {
        return;
    }

    elements.profileCategory.innerHTML = `
        <option value="">
            Vælg fagområde
        </option>

        ${state.categories
        .map(category => `
                <option value="${category.id}">
                    ${escapeHtml(category.name)}
                </option>
            `)
        .join("")}
    `;
}


// ==================================================
// FAGFOLK
// ==================================================

function renderProfessionals() {
    if (!elements.professionalGrid) {
        return;
    }

    let professionals =
        [...state.professionals];

    if (state.selectedCategoryId !== null) {
        professionals =
            professionals.filter(
                professional =>
                    Number(
                        professional.categoryId
                    ) ===
                    state.selectedCategoryId
            );
    }

    if (state.searchText) {
        professionals =
            professionals.filter(
                professional => {
                    const searchableText = [
                        professional.companyName,
                        professional.categoryName,
                        professional.description
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        state.searchText
                    );
                }
            );
    }

    if (state.locationText) {
        professionals =
            professionals.filter(
                professional =>
                    String(
                        professional.location || ""
                    )
                        .toLowerCase()
                        .includes(
                            state.locationText
                        )
            );
    }

    professionals.sort(
        (first, second) => {
            if (state.sortBy === "name") {
                return String(
                    first.companyName || ""
                ).localeCompare(
                    String(
                        second.companyName || ""
                    ),
                    "da"
                );
            }

            if (state.sortBy === "location") {
                return String(
                    first.location || ""
                ).localeCompare(
                    String(
                        second.location || ""
                    ),
                    "da"
                );
            }

            return (
                Number(second.rating || 0) -
                Number(first.rating || 0)
            );
        }
    );

    const count = professionals.length;

    if (elements.resultCount) {
        elements.resultCount.textContent =
            `${count} ${
                count === 1
                    ? "fagperson"
                    : "fagfolk"
            }`;
    }

    if (elements.professionalCount) {
        elements.professionalCount.textContent =
            String(
                state.professionals.length
            );
    }

    if (!professionals.length) {
        elements.professionalGrid.innerHTML = `
            <div class="empty-state">
                <span>🔎</span>

                <h3>
                    Ingen profiler matcher din søgning
                </h3>

                <p>
                    Prøv et andet fagområde eller et bredere område.
                </p>
            </div>
        `;

        return;
    }

    elements.professionalGrid.innerHTML =
        professionals
            .map(professional => {
                const companyName =
                    professional.companyName ||
                    "Ukendt virksomhed";

                const initials =
                    getInitials(companyName);

                const rating =
                    Number(
                        professional.rating || 0
                    );

                const ratingText =
                    rating > 0
                        ? `★ ${rating.toFixed(1)}`
                        : "Ny profil";

                return `
                    <article class="professional-card">

                        <div class="professional-top">

                            <div class="avatar">
                                ${escapeHtml(initials)}
                            </div>

                            <span class="rating-badge">
                                ${ratingText}
                            </span>

                        </div>

                        <h3>
                            ${escapeHtml(companyName)}
                        </h3>

                        <span class="professional-category">

                            ${escapeHtml(
                    professional.categoryIcon ||
                    "🛠️"
                )}

                            ${escapeHtml(
                    professional.categoryName ||
                    "Fagområde"
                )}

                        </span>

                        <p class="professional-description">

                            ${escapeHtml(
                    professional.description ||
                    "Denne virksomhed har endnu ikke tilføjet en beskrivelse."
                )}

                        </p>

                        <div class="professional-meta">

                            <span>
                                📍
                                ${escapeHtml(
                    professional.location ||
                    "Område ikke angivet"
                )}
                            </span>

                            ${
                    professional.phone
                        ? `
                                        <span>
                                            ☎
                                            ${escapeHtml(
                            professional.phone
                        )}
                                        </span>
                                    `
                        : ""
                }

                        </div>

                        <div class="professional-actions">

                            ${
                    professional.phone
                        ? `
                                        <a
                                            class="contact-primary"
                                            href="tel:${encodeURIComponent(
                            professional.phone
                        )}"
                                        >
                                            Ring op
                                        </a>
                                    `
                        : `
                                        <span
                                            class="contact-primary button"
                                            aria-disabled="true"
                                        >
                                            Intet nummer
                                        </span>
                                    `
                }

                            ${
                    professional.email
                        ? `
                                        <a
                                            class="contact-secondary"
                                            href="mailto:${encodeURIComponent(
                            professional.email
                        )}"
                                        >
                                            Send email
                                        </a>
                                    `
                        : `
                                        <span
                                            class="contact-secondary button"
                                            aria-disabled="true"
                                        >
                                            Ingen email
                                        </span>
                                    `
                }

                        </div>

                    </article>
                `;
            })
            .join("");
}


// ==================================================
// NYHEDER
// ==================================================

function renderNews() {
    if (!elements.newsGrid) {
        return;
    }

    if (!state.news.length) {
        elements.newsGrid.innerHTML = `
            <div class="empty-state">
                <span>✦</span>

                <h3>
                    Ingen nyheder endnu
                </h3>

                <p>
                    Publicerede nyheder vises her.
                </p>
            </div>
        `;

        return;
    }

    elements.newsGrid.innerHTML =
        state.news
            .map(news => `
                <article
                    class="home-news-card ${
                news.featured
                    ? "featured"
                    : ""
            }"
                >

                    ${
                news.imageUrl
                    ? `
                                <img
                                    src="${escapeHtml(
                        news.imageUrl
                    )}"
                                    alt=""
                                    loading="lazy"
                                >
                            `
                    : `
                                <div class="news-placeholder">
                                    W
                                </div>
                            `
            }

                    <div class="home-news-content">

                        <div class="home-news-meta">

                            ${
                news.featured
                    ? "<span>Fremhævet</span>"
                    : ""
            }

                            <time>
                                ${formatNewsDate(
                news.publishedAt
            )}
                            </time>

                        </div>

                        <h3>
                            ${escapeHtml(news.title)}
                        </h3>

                        <p>
                            ${escapeHtml(
                news.summary ||
                news.content ||
                ""
            )}
                        </p>

                    </div>

                </article>
            `)
            .join("");
}


function formatNewsDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "da-DK",
        {
            dateStyle: "long"
        }
    ).format(date);
}


// ==================================================
// LOGIN
// ==================================================

async function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const email =
        formData.get("email")?.trim();

    const password =
        formData.get("password");

    if (!email || !password) {
        showToast(
            "Du skal skrive både email og adgangskode.",
            true
        );

        return;
    }

    try {
        const response = await apiRequest(
            "/auth/login",
            {
                method: "POST",
                auth: false,
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        saveSession(response);

        closeModal("auth-modal");

        form.reset();

        redirectAfterLogin(
            response.role
        );

    } catch (error) {
        console.error(
            "Loginfejl:",
            error
        );

        showToast(
            error.message,
            true
        );
    }
}


// ==================================================
// REGISTRERING
// ==================================================

async function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
        const response = await apiRequest(
            "/auth/register",
            {
                method: "POST",
                auth: false,
                body: JSON.stringify({
                    name:
                        formData
                            .get("name")
                            ?.trim(),

                    email:
                        formData
                            .get("email")
                            ?.trim(),

                    password:
                        formData
                            .get("password")
                })
            }
        );

        form.reset();

        if (response?.token) {
            saveSession(response);

            closeModal("auth-modal");

            redirectAfterLogin(
                response.role
            );

            return;
        }

        switchAuthView("login");

        showToast(
            response?.message ||
            "Brugeren blev oprettet. Du kan nu logge ind."
        );

    } catch (error) {
        console.error(
            "Registreringsfejl:",
            error
        );

        showToast(
            error.message,
            true
        );
    }
}


// ==================================================
// VIRKSOMHEDSPROFIL
// ==================================================

async function handleCreateProfile(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const categoryId =
        Number(
            formData.get("categoryId")
        );

    if (!categoryId) {
        showToast(
            "Du skal vælge et fagområde.",
            true
        );

        return;
    }

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "Sender profil...";
        }

        await apiRequest(
            "/entrepreneurs",
            {
                method: "POST",
                body: JSON.stringify({
                    companyName:
                        formData
                            .get("companyName")
                            ?.trim(),

                    description:
                        formData
                            .get("description")
                            ?.trim(),

                    phone:
                        formData
                            .get("phone")
                            ?.trim(),

                    email:
                        formData
                            .get("email")
                            ?.trim(),

                    location:
                        formData
                            .get("location")
                            ?.trim(),

                    categoryId
                })
            }
        );

        form.reset();

        closeModal("profile-modal");

        showToast(
            "Profilen er sendt til godkendelse."
        );

    } catch (error) {
        console.error(
            "Fejl ved oprettelse af profil:",
            error
        );

        showToast(
            error.message ||
            "Profilen kunne ikke oprettes.",
            true
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;

            submitButton.textContent =
                "Send profil til godkendelse";
        }
    }
}


function handleProfileButton() {
    if (
        !localStorage.getItem(
            "worklyToken"
        )
    ) {
        switchAuthView("register");

        openModal("auth-modal");

        showToast(
            "Opret eller log ind på en bruger først."
        );

        return;
    }

    openModal("profile-modal");
}


// ==================================================
// SESSION OG BRUGEROMRÅDE
// ==================================================

function saveSession(response) {
    if (!response?.token) {
        throw new Error(
            "Backend returnerede ikke en JWT-token."
        );
    }

    localStorage.setItem(
        "worklyToken",
        response.token
    );

    localStorage.setItem(
        "worklyUser",
        JSON.stringify({
            name: response.name,
            email: response.email,
            role: response.role
        })
    );

    updateUserArea();
}


function redirectAfterLogin(role) {
    const normalizedRole =
        String(role || "")
            .replace("ROLE_", "")
            .toUpperCase();

    if (normalizedRole === "ADMIN") {
        window.location.href =
            "/admin.html";

        return;
    }

    if (
        normalizedRole ===
        "ENTREPRENEUR"
    ) {
        window.location.href =
            "/entrepreneur.html";

        return;
    }

    window.location.href = "/";
}


function logout(showMessage = true) {
    localStorage.removeItem(
        "worklyToken"
    );

    localStorage.removeItem(
        "worklyUser"
    );

    updateUserArea();

    if (showMessage) {
        showToast(
            "Du er logget ud."
        );
    }
}


function updateUserArea() {
    const user = getStoredUser();

    const loggedIn = Boolean(
        user &&
        localStorage.getItem(
            "worklyToken"
        )
    );

    const role =
        String(user?.role || "")
            .replace("ROLE_", "")
            .toUpperCase();

    const isAdmin =
        loggedIn &&
        role === "ADMIN";

    if (elements.userArea) {
        elements.userArea.hidden =
            !loggedIn;
    }

    if (elements.loginButton) {
        elements.loginButton.hidden =
            loggedIn;
    }

    if (elements.userName) {
        elements.userName.textContent =
            loggedIn
                ? user.name ||
                user.email
                : "";
    }

    if (
        elements.adminDashboardButton
    ) {
        elements.adminDashboardButton.hidden =
            !isAdmin;
    }
}


function getStoredUser() {
    try {
        const storedUser =
            localStorage.getItem(
                "worklyUser"
            );

        return storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch {
        return null;
    }
}


// ==================================================
// MODALER
// ==================================================

function switchAuthView(view) {
    const showLogin =
        view === "login";

    if (elements.loginForm) {
        elements.loginForm.hidden =
            !showLogin;
    }

    if (elements.registerForm) {
        elements.registerForm.hidden =
            showLogin;
    }

    elements.loginTab
        ?.classList
        .toggle(
            "active",
            showLogin
        );

    elements.registerTab
        ?.classList
        .toggle(
            "active",
            !showLogin
        );
}


function openModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".modal.open"
        )
    ) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}


// ==================================================
// HJÆLPEFUNKTIONER
// ==================================================

function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (
        Array.isArray(
            value?.content
        )
    ) {
        return value.content;
    }

    return [];
}


function showToast(
    message,
    isError = false
) {
    if (!elements.toast) {
        return;
    }

    clearTimeout(toastTimer);

    elements.toast.textContent =
        message;

    elements.toast.classList.toggle(
        "error",
        isError
    );

    elements.toast.classList.add(
        "show"
    );

    toastTimer = setTimeout(
        () => {
            elements.toast
                .classList
                .remove("show");
        },
        5000
    );
}


function getInitials(name) {
    return String(name || "W")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word[0].toUpperCase()
        )
        .join("");
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll(
            "'",
            "&#039;"
        );
}