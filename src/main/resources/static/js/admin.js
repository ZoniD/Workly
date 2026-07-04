const API_BASE =
    window.location.port === "8080"
        ? "/api"
        : "http://localhost:8080/api";


const token =
    localStorage.getItem("worklyToken");


const currentUser =
    getStoredUser();


const currentRole =
    String(currentUser?.role || "")
        .replace("ROLE_", "")
        .toUpperCase();


if (
    !token ||
    !currentUser ||
    currentRole !== "ADMIN"
) {
    window.location.replace("/");
}


const state = {
    professionals: [],
    news: [],
    categories: []
};


const elements = {
    pageTitle:
        document.querySelector("#page-title"),

    adminName:
        document.querySelector("#admin-name"),

    adminEmail:
        document.querySelector("#admin-email"),

    adminInitials:
        document.querySelector("#admin-initials"),

    pendingCount:
        document.querySelector("#pending-count"),

    approvedCount:
        document.querySelector("#approved-count"),

    userCount:
        document.querySelector("#user-count"),

    publishedNewsCount:
        document.querySelector("#published-news-count"),

    pendingTableBody:
        document.querySelector("#pending-table-body"),

    professionalTableBody:
        document.querySelector("#professional-table-body"),

    professionalFilter:
        document.querySelector("#professional-filter"),

    professionalForm:
        document.querySelector("#professional-form"),

    categorySelect:
        document.querySelector("#admin-category-select"),

    newsList:
        document.querySelector("#news-list"),

    newsForm:
        document.querySelector("#news-form"),

    newsModalTitle:
        document.querySelector("#news-modal-title"),

    toast:
        document.querySelector("#toast")
};


let toastTimer;


// ==================================================
// INITIALISERING
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        initializeAdminIdentity();
        bindEvents();
        await loadAllData();
    }
);


function initializeAdminIdentity() {
    elements.adminName.textContent =
        currentUser.name ||
        "Administrator";

    elements.adminEmail.textContent =
        currentUser.email ||
        "";

    elements.adminInitials.textContent =
        getInitials(
            currentUser.name ||
            "Admin"
        );
}


// ==================================================
// EVENTS
// ==================================================

function bindEvents() {
    document
        .querySelectorAll("[data-view-button]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    showView(
                        button.dataset.viewButton
                    );
                }
            );
        });

    document
        .querySelectorAll("[data-go-to]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    showView(
                        button.dataset.goTo
                    );
                }
            );
        });

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

    document
        .querySelector("#open-professional-modal")
        .addEventListener(
            "click",
            () => {
                openModal(
                    "professional-modal"
                );
            }
        );

    document
        .querySelector("#open-news-modal")
        .addEventListener(
            "click",
            openCreateNewsModal
        );

    document
        .querySelector("#logout-button")
        .addEventListener(
            "click",
            logout
        );

    elements.professionalFilter
        .addEventListener(
            "change",
            renderProfessionalTable
        );

    elements.professionalForm
        .addEventListener(
            "submit",
            handleCreateProfessional
        );

    elements.newsForm
        .addEventListener(
            "submit",
            handleSaveNews
        );

    elements.pendingTableBody
        .addEventListener(
            "click",
            handleProfessionalAction
        );

    elements.professionalTableBody
        .addEventListener(
            "click",
            handleProfessionalAction
        );

    elements.newsList
        .addEventListener(
            "click",
            handleNewsAction
        );

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


// ==================================================
// DATA
// ==================================================

async function loadAllData() {
    try {
        const [
            stats,
            professionals,
            news,
            categories
        ] = await Promise.all([
            apiRequest("/admin/dashboard"),
            apiRequest("/admin/entrepreneurs"),
            apiRequest("/admin/news"),
            apiRequest("/categories")
        ]);

        state.professionals =
            professionals;

        state.news =
            news;

        state.categories =
            categories;

        renderStats(stats);
        renderPendingTable();
        renderProfessionalTable();
        renderNews();
        renderCategories();

    } catch (error) {
        handleAuthorizationError(error);

        showToast(
            error.message,
            true
        );
    }
}


async function refreshProfessionalsAndStats() {
    const [
        stats,
        professionals
    ] = await Promise.all([
        apiRequest("/admin/dashboard"),
        apiRequest("/admin/entrepreneurs")
    ]);

    state.professionals =
        professionals;

    renderStats(stats);
    renderPendingTable();
    renderProfessionalTable();
}


async function refreshNewsAndStats() {
    const [
        stats,
        news
    ] = await Promise.all([
        apiRequest("/admin/dashboard"),
        apiRequest("/admin/news")
    ]);

    state.news =
        news;

    renderStats(stats);
    renderNews();
}


// ==================================================
// API
// ==================================================

async function apiRequest(
    path,
    options = {}
) {
    const response = await fetch(
        `${API_BASE}${path}`,
        {
            ...options,

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        }
    );

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    const data =
        contentType.includes(
            "application/json"
        )
            ? await response.json()
            : null;

    if (!response.ok) {
        const error = new Error(
            data?.message ||
            `HTTP-fejl ${response.status}`
        );

        error.status =
            response.status;

        throw error;
    }

    return data;
}


// ==================================================
// DASHBOARD
// ==================================================

function renderStats(stats) {
    elements.pendingCount.textContent =
        stats.pendingEntrepreneurs;

    elements.approvedCount.textContent =
        stats.approvedEntrepreneurs;

    elements.userCount.textContent =
        stats.registeredUsers;

    elements.publishedNewsCount.textContent =
        stats.publishedNews;
}


// ==================================================
// FAGPERSONER
// ==================================================

function renderPendingTable() {
    const pending =
        state.professionals.filter(
            professional =>
                professional.status ===
                "PENDING" &&
                professional.active
        );

    if (!pending.length) {
        elements.pendingTableBody.innerHTML =
            emptyTableRow(
                5,
                "Der er ingen ansøgninger, som afventer behandling."
            );

        return;
    }

    elements.pendingTableBody.innerHTML =
        pending
            .map(professional => `
                <tr>

                    <td>
                        <div class="cell-main">

                            <strong>
                                ${escapeHtml(
                professional.companyName
            )}
                            </strong>

                            <small>
                                ${escapeHtml(
                professional.businessEmail ||
                professional.phone ||
                "Ingen kontaktoplysninger"
            )}
                            </small>

                        </div>
                    </td>

                    <td>
                        <div class="cell-main">

                            <span>
                                ${escapeHtml(
                professional.ownerName
            )}
                            </span>

                            <small>
                                ${escapeHtml(
                professional.loginEmail
            )}
                            </small>

                        </div>
                    </td>

                    <td>
                        ${escapeHtml(
                professional.categoryName
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                professional.location
            )}
                    </td>

                    <td>
                        ${professionalActions(
                professional,
                true
            )}
                    </td>

                </tr>
            `)
            .join("");
}


function renderProfessionalTable() {
    const selectedStatus =
        elements.professionalFilter.value;

    const professionals =
        selectedStatus
            ? state.professionals.filter(
                item =>
                    item.status ===
                    selectedStatus
            )
            : state.professionals;

    if (!professionals.length) {
        elements.professionalTableBody.innerHTML =
            emptyTableRow(
                6,
                "Der blev ikke fundet nogen fagpersoner."
            );

        return;
    }

    elements.professionalTableBody.innerHTML =
        professionals
            .map(professional => `
                <tr>

                    <td>
                        <div class="cell-main">

                            <strong>
                                ${escapeHtml(
                professional.companyName
            )}
                            </strong>

                            <small>
                                ${escapeHtml(
                professional.location
            )}
                            </small>

                        </div>
                    </td>

                    <td>
                        <div class="cell-main">

                            <span>
                                ${escapeHtml(
                professional.ownerName
            )}
                            </span>

                            <small>
                                ${escapeHtml(
                professional.loginEmail
            )}
                            </small>

                        </div>
                    </td>

                    <td>
                        ${escapeHtml(
                professional.categoryName
            )}
                    </td>

                    <td>
                        ${statusBadge(
                professional.status
            )}
                    </td>

                    <td>
                        ${
                professional.active
                    ? "Ja"
                    : "Nej"
            }
                    </td>

                    <td>
                        ${professionalActions(
                professional,
                false
            )}
                    </td>

                </tr>
            `)
            .join("");
}


function professionalActions(
    professional,
    compact
) {
    const actions = [];

    if (
        professional.status !==
        "APPROVED"
    ) {
        actions.push(
            actionButton(
                "Godkend",
                "approve",
                professional.id,
                "approve"
            )
        );
    }

    if (
        professional.status !==
        "REJECTED"
    ) {
        actions.push(
            actionButton(
                "Afvis",
                "reject",
                professional.id,
                "reject"
            )
        );
    }

    if (
        !compact &&
        professional.status !==
        "SUSPENDED"
    ) {
        actions.push(
            actionButton(
                "Suspendér",
                "suspend",
                professional.id
            )
        );
    }

    if (!compact) {
        if (professional.active) {
            actions.push(
                actionButton(
                    "Fjern",
                    "remove",
                    professional.id,
                    "remove"
                )
            );
        } else {
            actions.push(
                actionButton(
                    "Gendan",
                    "restore",
                    professional.id
                )
            );
        }
    }

    return `
        <div class="action-row">
            ${actions.join("")}
        </div>
    `;
}


function actionButton(
    label,
    action,
    id,
    className = ""
) {
    return `
        <button
            class="action-button ${className}"
            type="button"
            data-professional-action="${action}"
            data-id="${id}"
        >
            ${label}
        </button>
    `;
}


async function handleProfessionalAction(
    event
) {
    const button =
        event.target.closest(
            "[data-professional-action]"
        );

    if (!button) {
        return;
    }

    const id =
        Number(
            button.dataset.id
        );

    const action =
        button.dataset.professionalAction;

    try {
        if (action === "remove") {
            if (
                !confirm(
                    "Fagpersonen skjules fra forsiden. Fortsæt?"
                )
            ) {
                return;
            }

            await apiRequest(
                `/admin/entrepreneurs/${id}`,
                {
                    method: "DELETE"
                }
            );

        } else if (
            action === "restore"
        ) {
            await apiRequest(
                `/admin/entrepreneurs/${id}/restore`,
                {
                    method: "PATCH"
                }
            );

        } else {
            const statusByAction = {
                approve: "APPROVED",
                reject: "REJECTED",
                suspend: "SUSPENDED"
            };

            await apiRequest(
                `/admin/entrepreneurs/${id}/status`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status:
                            statusByAction[action]
                    })
                }
            );
        }

        await refreshProfessionalsAndStats();

        showToast(
            "Fagpersonen blev opdateret."
        );

    } catch (error) {
        handleAuthorizationError(error);

        showToast(
            error.message,
            true
        );
    }
}


async function handleCreateProfessional(
    event
) {
    event.preventDefault();

    const formData =
        new FormData(
            event.currentTarget
        );

    try {
        await apiRequest(
            "/admin/entrepreneurs",
            {
                method: "POST",

                body: JSON.stringify({
                    userName:
                        formData.get(
                            "userName"
                        ),

                    userEmail:
                        formData.get(
                            "userEmail"
                        ),

                    temporaryPassword:
                        formData.get(
                            "temporaryPassword"
                        ),

                    companyName:
                        formData.get(
                            "companyName"
                        ),

                    description:
                        formData.get(
                            "description"
                        ),

                    phone:
                        formData.get(
                            "phone"
                        ),

                    businessEmail:
                        formData.get(
                            "businessEmail"
                        ),

                    location:
                        formData.get(
                            "location"
                        ),

                    categoryId:
                        Number(
                            formData.get(
                                "categoryId"
                            )
                        )
                })
            }
        );

        event.currentTarget.reset();

        closeModal(
            "professional-modal"
        );

        await refreshProfessionalsAndStats();

        showToast(
            "Fagpersonen blev oprettet og godkendt."
        );

    } catch (error) {
        handleAuthorizationError(error);

        showToast(
            error.message,
            true
        );
    }
}


function renderCategories() {
    elements.categorySelect.innerHTML = `
        <option value="">
            Vælg kategori
        </option>

        ${state.categories
        .map(category => `
                <option value="${category.id}">
                    ${escapeHtml(
            category.name
        )}
                </option>
            `)
        .join("")}
    `;
}


// ==================================================
// NYHEDER
// ==================================================

function renderNews() {
    if (!state.news.length) {
        elements.newsList.innerHTML = `
            <div class="empty-state">
                Der er endnu ikke oprettet nyheder.
            </div>
        `;

        return;
    }

    elements.newsList.innerHTML =
        state.news
            .map(news => `
                <article class="news-admin-card">

                    <div>

                        <h3>
                            ${escapeHtml(
                news.title
            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                news.summary ||
                shorten(
                    news.content,
                    180
                )
            )}
                        </p>

                        <div class="news-meta">

                            ${statusBadge(
                news.status
            )}

                            <span>
                                Af
                                ${escapeHtml(
                news.authorName
            )}
                            </span>

                            <span>
                                ${formatDate(
                news.updatedAt
            )}
                            </span>

                            ${
                news.featured
                    ? "<span>★ Fremhævet</span>"
                    : ""
            }

                        </div>

                    </div>

                    <div class="action-row">

                        <button
                            class="action-button"
                            type="button"
                            data-news-action="edit"
                            data-id="${news.id}"
                        >
                            Redigér
                        </button>

                        ${
                news.status !==
                "PUBLISHED"
                    ? `
                                    <button
                                        class="action-button approve"
                                        type="button"
                                        data-news-action="publish"
                                        data-id="${news.id}"
                                    >
                                        Publicér
                                    </button>
                                `
                    : `
                                    <button
                                        class="action-button"
                                        type="button"
                                        data-news-action="draft"
                                        data-id="${news.id}"
                                    >
                                        Gør til kladde
                                    </button>
                                `
            }

                        ${
                news.status !==
                "ARCHIVED"
                    ? `
                                    <button
                                        class="action-button remove"
                                        type="button"
                                        data-news-action="archive"
                                        data-id="${news.id}"
                                    >
                                        Arkivér
                                    </button>
                                `
                    : ""
            }

                    </div>

                </article>
            `)
            .join("");
}


function openCreateNewsModal() {
    elements.newsForm.reset();

    elements.newsForm
        .elements
        .newsId
        .value = "";

    elements.newsModalTitle.textContent =
        "Skriv nyhed";

    openModal(
        "news-modal"
    );
}


function openEditNewsModal(news) {
    const form =
        elements.newsForm;

    form.elements.newsId.value =
        news.id;

    form.elements.title.value =
        news.title || "";

    form.elements.summary.value =
        news.summary || "";

    form.elements.content.value =
        news.content || "";

    form.elements.imageUrl.value =
        news.imageUrl || "";

    form.elements.featured.checked =
        Boolean(
            news.featured
        );

    elements.newsModalTitle.textContent =
        "Redigér nyhed";

    openModal(
        "news-modal"
    );
}


async function handleNewsAction(
    event
) {
    const button =
        event.target.closest(
            "[data-news-action]"
        );

    if (!button) {
        return;
    }

    const id =
        Number(
            button.dataset.id
        );

    const action =
        button.dataset.newsAction;

    const news =
        state.news.find(
            item =>
                item.id === id
        );

    if (action === "edit") {
        openEditNewsModal(news);
        return;
    }

    try {
        if (action === "archive") {
            if (
                !confirm(
                    "Nyheden arkiveres og fjernes fra forsiden. Fortsæt?"
                )
            ) {
                return;
            }

            await apiRequest(
                `/admin/news/${id}`,
                {
                    method: "DELETE"
                }
            );

        } else {
            const status =
                action === "publish"
                    ? "PUBLISHED"
                    : "DRAFT";

            await apiRequest(
                `/admin/news/${id}/status`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status
                    })
                }
            );
        }

        await refreshNewsAndStats();

        showToast(
            "Nyheden blev opdateret."
        );

    } catch (error) {
        handleAuthorizationError(error);

        showToast(
            error.message,
            true
        );
    }
}


async function handleSaveNews(
    event
) {
    event.preventDefault();

    const form =
        event.currentTarget;

    const formData =
        new FormData(form);

    const newsId =
        formData.get("newsId");

    const payload = {
        title:
            formData.get("title"),

        summary:
            formData.get("summary"),

        content:
            formData.get("content"),

        imageUrl:
            formData.get("imageUrl"),

        featured:
            formData.get("featured") ===
            "on"
    };

    try {
        await apiRequest(
            newsId
                ? `/admin/news/${newsId}`
                : "/admin/news",
            {
                method:
                    newsId
                        ? "PUT"
                        : "POST",

                body:
                    JSON.stringify(payload)
            }
        );

        form.reset();

        closeModal(
            "news-modal"
        );

        await refreshNewsAndStats();

        showToast(
            newsId
                ? "Nyheden blev gemt."
                : "Nyheden blev oprettet som kladde."
        );

    } catch (error) {
        handleAuthorizationError(error);

        showToast(
            error.message,
            true
        );
    }
}


// ==================================================
// VISNINGER OG MODALER
// ==================================================

function showView(viewName) {
    document
        .querySelectorAll("[data-view]")
        .forEach(view => {
            view.classList.toggle(
                "active",
                view.dataset.view ===
                viewName
            );
        });

    document
        .querySelectorAll("[data-view-button]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.viewButton ===
                viewName
            );
        });

    const titles = {
        overview: "Oversigt",
        professionals: "Fagpersoner",
        news: "Nyheder"
    };

    elements.pageTitle.textContent =
        titles[viewName] ||
        "Administration";
}


function openModal(id) {
    const modal =
        document.getElementById(id);

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeModal(id) {
    const modal =
        document.getElementById(id);

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ==================================================
// SESSION OG ADGANGSKONTROL
// ==================================================

function getStoredUser() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "worklyUser"
            )
        );

    } catch {
        return null;
    }
}


function handleAuthorizationError(
    error
) {
    if (
        error.status === 401 ||
        error.status === 403
    ) {
        localStorage.removeItem(
            "worklyToken"
        );

        localStorage.removeItem(
            "worklyUser"
        );

        window.location.replace("/");
    }
}


function logout() {
    localStorage.removeItem(
        "worklyToken"
    );

    localStorage.removeItem(
        "worklyUser"
    );

    window.location.replace("/");
}


// ==================================================
// HJÆLPEFUNKTIONER
// ==================================================

function statusBadge(status) {
    const labels = {
        PENDING: "Afventer",
        APPROVED: "Godkendt",
        REJECTED: "Afvist",
        SUSPENDED: "Suspenderet",
        DRAFT: "Kladde",
        PUBLISHED: "Publiceret",
        ARCHIVED: "Arkiveret"
    };

    return `
        <span
            class="status-badge status-${status.toLowerCase()}"
        >
            ${labels[status] || status}
        </span>
    `;
}


function emptyTableRow(
    columns,
    message
) {
    return `
        <tr class="empty-row">
            <td colspan="${columns}">
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}


function formatDate(value) {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "da-DK",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(
        new Date(value)
    );
}


function shorten(
    value,
    length
) {
    const text =
        value || "";

    return text.length > length
        ? `${text.slice(0, length)}…`
        : text;
}


function getInitials(value) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part =>
            part
                .charAt(0)
                .toUpperCase()
        )
        .join("");
}


function showToast(
    message,
    isError = false
) {
    clearTimeout(toastTimer);

    elements.toast.textContent =
        message;

    elements.toast.classList.toggle(
        "error",
        isError
    );

    elements.toast.classList.add(
        "visible"
    );

    toastTimer = setTimeout(
        () => {
            elements.toast
                .classList
                .remove("visible");
        },
        3500
    );
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