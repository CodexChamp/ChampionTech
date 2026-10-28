document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

const themeButtons = document.querySelectorAll("[data-theme-value]");
const themeStorageKey = "championtech-theme";
const fireworksCanvas = document.getElementById("fireworks-background");
const serviceCards = document.querySelectorAll("[data-service-key]");
const serviceDetailTitle = document.getElementById("service-detail-title");
const serviceDetailSummary = document.getElementById("service-detail-summary");
const serviceDetailBenefits = document.getElementById("service-detail-benefits");
const serviceDetailFaqs = document.getElementById("service-detail-faqs");
const emailTriggers = document.querySelectorAll("[data-email-trigger]");
const emailModal = document.getElementById("email-choice-modal");
const emailBackdrop = document.getElementById("email-choice-backdrop");
const emailCloseButton = document.getElementById("email-choice-close");
let fireworksAnimationFrame = null;
let fireworksRenderer = null;

const serviceDetails = {
    "internal-web-apps": {
        title: "Internal Web Apps",
        summary: "Custom internal tools give your team one place to handle the work instead of juggling spreadsheets, email threads, and sticky-note processes.",
        benefits: [
            "Reduce confusion by giving staff one consistent workflow.",
            "Make daily operations faster with dashboards, forms, and shared visibility.",
            "Cut down on mistakes caused by duplicate entry and scattered files."
        ],
        faqs: [
            {
                question: "Do we need a giant platform for this?",
                answer: "Usually no. A focused internal app is often a better fit for a small business than paying for a bloated system."
            },
            {
                question: "Will this actually save time?",
                answer: "Yes, when it replaces repeated manual steps and makes common tasks easier for the people doing the work every day."
            }
        ]
    },
    "database-tools": {
        title: "Database Tools",
        summary: "When important business information lives in too many places, database tools help organize it so your team can search it, trust it, and report on it.",
        benefits: [
            "Turn scattered data into one usable system.",
            "Support reporting, searching, and cleaner day-to-day entry workflows.",
            "Make growth easier by replacing fragile spreadsheet setups with something more dependable."
        ],
        faqs: [
            {
                question: "Why not just keep using spreadsheets?",
                answer: "Spreadsheets work until too many people, steps, or exceptions depend on them. Then they become risky and hard to manage."
            },
            {
                question: "Can this work with SQL or Azure storage?",
                answer: "Yes. I can build around SQL-backed systems and Azure-based data storage solutions depending on what fits the project."
            }
        ]
    },
    "workflow-automation": {
        title: "Workflow Automation",
        summary: "Automation helps remove the repetitive parts of the job so your team can spend less time doing copy-paste work and more time handling real decisions.",
        benefits: [
            "Reduce manual steps that waste staff time every week.",
            "Lower the chance of human error in repetitive tasks.",
            "Keep work moving even when the process has many handoffs."
        ],
        faqs: [
            {
                question: "Does automation mean replacing people?",
                answer: "No. The goal is usually to remove low-value repetitive tasks so people can focus on the work that actually needs them."
            },
            {
                question: "What kinds of things can be automated?",
                answer: "Imports, cleanup, notifications, status updates, report generation, and many copy-paste style workflows are common examples."
            }
        ]
    },
    "tablet-mobile-workflows": {
        title: "Tablet and Mobile Workflows",
        summary: "If work happens in the field, on the lot, in a warehouse, or away from a desk, mobile-friendly tools make the process easier to complete in the moment.",
        benefits: [
            "Let staff scan, upload, take photos, and submit work from where it actually happens.",
            "Reduce delays caused by waiting to re-enter information later.",
            "Improve accuracy by capturing details at the point of work."
        ],
        faqs: [
            {
                question: "Why does mobile workflow matter so much?",
                answer: "Because when a process depends on writing things down now and typing them in later, things get missed, delayed, or entered wrong."
            },
            {
                question: "Can it still be simple for staff to use?",
                answer: "That is the goal. These tools should feel practical and direct, especially on tablets and phones."
            }
        ]
    },
    "website-fixes": {
        title: "Website Fixes and Improvements",
        summary: "Sometimes a business does not need a full rebuild. It just needs the current site to work better, look cleaner, and stop losing leads or causing confusion.",
        benefits: [
            "Fix broken forms and frustrating page issues.",
            "Improve trust by making the site clearer and easier to use.",
            "Add useful features without starting over from scratch."
        ],
        faqs: [
            {
                question: "Do we need a completely new website?",
                answer: "Not always. A lot of value can come from improving the site you already have if the core problem is usability or missing features."
            },
            {
                question: "Can small changes still matter?",
                answer: "Yes. Better forms, clearer layouts, and simpler user paths can make a real difference in whether people follow through."
            }
        ]
    },
    "legacy-cleanup": {
        title: "Legacy System Modernization",
        summary: "Older systems often still run important parts of the business, but they become harder to trust and harder to grow with. Modernization work helps move those processes into cleaner, more reliable tools.",
        benefits: [
            "Reduce the risk of fragile old processes breaking at the wrong time.",
            "Replace outdated tools and workarounds with something easier to maintain.",
            "Create a cleaner path toward modern systems without forcing a giant rewrite all at once."
        ],
        faqs: [
            {
                question: "Do we have to replace everything at once?",
                answer: "Usually no. A lot of businesses need a smart transition plan, not a disruptive all-at-once rebuild."
            },
            {
                question: "Can older Access or messy code still be moved forward?",
                answer: "Yes. Part of the job is helping businesses move away from outdated setups and into something more modern, usable, and easier to manage."
            }
        ]
    }
};

function applyTheme(themeName) {
    document.body.dataset.theme = themeName;

    themeButtons.forEach((button) => {
        const isActive = button.getAttribute("data-theme-value") === themeName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    syncFireworksTheme(themeName);
}

function createFireworksRenderer(canvas) {
    const context = canvas.getContext("2d");
    let fireworks = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            };
            this.alpha = 1;
            this.friction = 0.985;
            this.gravity = 0.035;
        }

        draw() {
            context.save();
            context.globalAlpha = this.alpha;
            context.beginPath();
            context.arc(this.x, this.y, 2.2, 0, Math.PI * 2, false);
            context.fillStyle = this.color;
            context.fill();
            context.restore();
        }

        update() {
            this.velocity.x *= this.friction;
            this.velocity.y = (this.velocity.y * this.friction) + this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.012;
        }
    }

    class Firework {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = { x: 0, y: Math.random() * -2.7 - 3.2 };
            this.particles = [];
            this.lifespan = 70 + Math.floor(Math.random() * 40);
            this.hasExploded = false;
        }

        draw() {
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, 2.8, 0, Math.PI * 2, false);
            context.fillStyle = this.color;
            context.fill();
            context.restore();
        }

        explode() {
            for (let i = 0; i < 42; i += 1) {
                this.particles.push(new Particle(this.x, this.y, this.color));
            }
        }

        update() {
            this.lifespan -= 1;

            if (this.lifespan <= 0 && !this.hasExploded) {
                this.explode();
                this.velocity = { x: 0, y: 0 };
                this.hasExploded = true;
            } else if (this.lifespan > 0) {
                this.y += this.velocity.y;
            }

            this.particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });
        }

        isFinished() {
            return this.lifespan <= 0 && this.particles.every((particle) => particle.alpha <= 0);
        }
    }

    function render() {
        context.fillStyle = "rgba(3, 8, 24, 0.18)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        fireworks.forEach((firework, index) => {
            firework.update();
            firework.draw();

            if (firework.isFinished()) {
                fireworks.splice(index, 1);
            }
        });

        if (Math.random() < 0.028) {
            const x = Math.random() * canvas.width;
            const hue = 10 + Math.random() * 340;
            fireworks.push(new Firework(x, canvas.height, `hsl(${hue}, 95%, 68%)`));
        }
    }

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        fireworks = [];
    }

    resize();

    return { resize, render, clear };
}

function runFireworks() {
    if (!fireworksRenderer || fireworksAnimationFrame) {
        return;
    }

    const frame = () => {
        fireworksRenderer.render();
        fireworksAnimationFrame = window.requestAnimationFrame(frame);
    };

    frame();
}

function stopFireworks() {
    if (fireworksAnimationFrame) {
        window.cancelAnimationFrame(fireworksAnimationFrame);
        fireworksAnimationFrame = null;
    }

    if (fireworksRenderer) {
        fireworksRenderer.clear();
    }
}

function syncFireworksTheme(themeName) {
    if (!fireworksCanvas) {
        return;
    }

    if (!fireworksRenderer) {
        fireworksRenderer = createFireworksRenderer(fireworksCanvas);
        window.addEventListener("resize", () => fireworksRenderer.resize());
    }

    if (themeName === "fireworks") {
        runFireworks();
    } else {
        stopFireworks();
    }
}

function openEmailChoice() {
    if (!emailModal || !emailBackdrop) {
        return;
    }

    emailModal.hidden = false;
    emailBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    emailCloseButton?.focus();
}

function closeEmailChoice() {
    if (!emailModal || !emailBackdrop) {
        return;
    }

    emailModal.hidden = true;
    emailBackdrop.hidden = true;
    document.body.style.overflow = "";
}

function renderServiceDetail(serviceKey) {
    const details = serviceDetails[serviceKey];
    if (!details || !serviceDetailTitle || !serviceDetailSummary || !serviceDetailBenefits || !serviceDetailFaqs) {
        return;
    }

    serviceDetailTitle.textContent = details.title;
    serviceDetailSummary.textContent = details.summary;
    serviceDetailBenefits.innerHTML = details.benefits.map((item) => `<li>${item}</li>`).join("");
    serviceDetailFaqs.innerHTML = details.faqs.map((item) => `
        <article class="service-faq-item">
            <h4>${item.question}</h4>
            <p>${item.answer}</p>
        </article>
    `).join("");

    serviceCards.forEach((card) => {
        const isActive = card.getAttribute("data-service-key") === serviceKey;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

const savedTheme = localStorage.getItem(themeStorageKey) || "simple";
applyTheme(savedTheme);

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedTheme = button.getAttribute("data-theme-value");
        if (!selectedTheme) {
            return;
        }

        applyTheme(selectedTheme);
        localStorage.setItem(themeStorageKey, selectedTheme);
    });
});

serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
        const serviceKey = card.getAttribute("data-service-key");
        if (!serviceKey) {
            return;
        }

        renderServiceDetail(serviceKey);
    });
});

if (serviceCards.length > 0) {
    renderServiceDetail(serviceCards[0].getAttribute("data-service-key"));
}

emailTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openEmailChoice);
});

emailBackdrop?.addEventListener("click", closeEmailChoice);
emailCloseButton?.addEventListener("click", closeEmailChoice);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && emailModal && !emailModal.hidden) {
        closeEmailChoice();
    }
});
