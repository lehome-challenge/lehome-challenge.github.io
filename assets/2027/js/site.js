document.addEventListener("DOMContentLoaded", () => {
    const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
    const sections = Array.from(document.querySelectorAll("[data-nav-section]"));

    if (sections.length === 0) return;

    const setActiveNav = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.dataset.navLink === id);
        });
    };

    const updateActiveNav = () => {
        const offset = (parseFloat(window.getComputedStyle(sections[0]).scrollMarginTop) || 0) + 1;
        let activeSection = sections[0];

        sections.forEach((section) => {
            if (section.getBoundingClientRect().top <= offset) {
                activeSection = section;
            }
        });

        // Short final sections cannot always reach the anchor offset.
        if (Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight) {
            activeSection = sections[sections.length - 1];
        }

        setActiveNav(activeSection.dataset.navSection);
    };

    let framePending = false;
    const scheduleUpdate = () => {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(() => {
            framePending = false;
            updateActiveNav();
        });
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    ["resize", "hashchange", "load", "pageshow"].forEach((event) => {
        window.addEventListener(event, scheduleUpdate);
    });
    updateActiveNav();
});
