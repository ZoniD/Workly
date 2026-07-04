const API_URL = "/api/entrepreneur";

const token = localStorage.getItem("worklyToken");

let currentProfile = null;

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
    if (!token) {
        window.location.replace("/");
        return;
    }

    registerEventListeners();

    await loadProfile();
}

function registerEventListeners() {
    document
        .getElementById("profile-form")
        .addEventListener("submit", updateProfile);

    document
        .getElementById("availability-toggle")
        .addEventListener("change", updateAvailability);

    document
        .getElementById("logout-button")
        .addEventListener("click", logout);
}

async function apiRequest(path, options = {}) {
    const headers = {
        ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),

        Authorization: `Bearer ${token}`,

        ...options.headers
    };

    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...options,
            headers
        }
    );

    if (!response.ok) {
        let message = `HTTP-fejl ${response.status}`;

        try {
            const body = await response.json();

            message =
                body.detail ||
                body.message ||
                message;

        } catch {
            const text = await response.text();

            if (text) {
                message = text;
            }
        }

        const error = new Error(message);

        error.status = response.status;

        throw error;
    }

    return response.json();
}

async function loadProfile() {
    try {
        const profile = await apiRequest("/profile");

        currentProfile = profile;

        renderProfile(profile);

    } catch (error) {
        console.error("Profilen kunne ikke indlæses:", error);

        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem("worklyToken");

            showMessage(
                "Du har ikke adgang til fagpersonportalen.",
                true
            );

            setTimeout(() => {
                window.location.replace("/");
            }, 1800);

            return;
        }

        showMessage(error.message, true);
    }
}

async function updateProfile(event) {
    event.preventDefault();

    const request = {
        companyName:
        document.getElementById("company-name").value,

        description:
        document.getElementById("description").value,

        phone:
        document.getElementById("phone").value,

        businessEmail:
        document.getElementById("business-email").value,

        location:
        document.getElementById("location").value
    };

    try {
        const profile = await apiRequest(
            "/profile",
            {
                method: "PUT",
                body: JSON.stringify(request)
            }
        );

        currentProfile = profile;

        renderProfile(profile);

        showMessage(
            "Virksomhedsprofilen blev opdateret.",
            false
        );

    } catch (error) {
        console.error("Profilopdatering fejlede:", error);

        showMessage(error.message, true);
    }
}

async function updateAvailability(event) {
    const toggle = event.target;

    try {
        const profile = await apiRequest(
            "/availability",
            {
                method: "PATCH",

                body: JSON.stringify({
                    availableForWork: toggle.checked
                })
            }
        );

        currentProfile = profile;

        renderProfile(profile);

        showMessage(
            profile.availableForWork
                ? "Din virksomhed tager nu imod nye opgaver."
                : "Din virksomhed er markeret som utilgængelig.",
            false
        );

    } catch (error) {
        console.error("Tilgængelighed kunne ikke ændres:", error);

        /*
         * Sæt toggle tilbage til den tidligere værdi,
         * hvis backend-kaldet fejler.
         */
        toggle.checked =
            currentProfile?.availableForWork ?? false;

        showMessage(error.message, true);
    }
}

function renderProfile(profile) {
    document.getElementById("profile-status").textContent =
        translateStatus(profile.status);

    document.getElementById("profile-status").dataset.status =
        profile.status;

    document.getElementById("summary-company-name").textContent =
        profile.companyName;

    document.getElementById("summary-category").textContent =
        profile.categoryName;

    document.getElementById("summary-owner").textContent =
        profile.ownerName;

    document.getElementById("summary-location").textContent =
        profile.location;

    document.getElementById("summary-rating").textContent =
        formatRating(profile.rating);

    document.getElementById("summary-active").textContent =
        profile.active ? "Ja" : "Nej";

    document.getElementById("availability-toggle").checked =
        profile.availableForWork;

    document.getElementById("company-name").value =
        profile.companyName ?? "";

    document.getElementById("description").value =
        profile.description ?? "";

    document.getElementById("phone").value =
        profile.phone ?? "";

    document.getElementById("business-email").value =
        profile.businessEmail ?? "";

    document.getElementById("location").value =
        profile.location ?? "";

    document.getElementById("category").value =
        profile.categoryName ?? "";

    renderPreview(profile);
}

function renderPreview(profile) {
    document.getElementById("preview-icon").textContent =
        profile.categoryIcon || "🔧";

    document.getElementById("preview-company").textContent =
        profile.companyName;

    document.getElementById("preview-category").textContent =
        profile.categoryName;

    document.getElementById("preview-description").textContent =
        profile.description ||
        "Virksomheden har endnu ikke skrevet en beskrivelse.";

    document.getElementById("preview-location").textContent =
        `📍 ${profile.location}`;

    document.getElementById("preview-rating").textContent =
        `⭐ ${formatRating(profile.rating)}`;

    const availabilityElement =
        document.getElementById("preview-availability");

    availabilityElement.textContent =
        profile.availableForWork
            ? "Tager imod nye opgaver"
            : "Tager ikke imod nye opgaver";

    availabilityElement.classList.toggle(
        "unavailable",
        !profile.availableForWork
    );

    const phoneLink =
        document.getElementById("preview-phone");

    phoneLink.href = `tel:${profile.phone}`;

    const emailLink =
        document.getElementById("preview-email");

    emailLink.href = `mailto:${profile.businessEmail}`;
}

function translateStatus(status) {
    const translations = {
        PENDING: "Afventer godkendelse",
        APPROVED: "Godkendt",
        REJECTED: "Afvist",
        SUSPENDED: "Suspenderet"
    };

    return translations[status] || status;
}

function formatRating(rating) {
    return Number(rating ?? 0)
        .toFixed(1)
        .replace(".", ",");
}

function showMessage(message, isError) {
    const element =
        document.getElementById("message-box");

    element.textContent = message;

    element.classList.remove(
        "hidden",
        "success",
        "error"
    );

    element.classList.add(
        isError ? "error" : "success"
    );

    window.clearTimeout(showMessage.timeout);

    showMessage.timeout = window.setTimeout(() => {
        element.classList.add("hidden");
    }, 4000);
}

function logout() {
    localStorage.removeItem("worklyToken");
    localStorage.removeItem("worklyUser");

    window.location.replace("/");
}