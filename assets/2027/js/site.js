document.addEventListener("DOMContentLoaded", () => {
    const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
    const sections = Array.from(document.querySelectorAll("[data-nav-section]"));

    const setActiveNav = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.dataset.navLink === id);
        });
    };

    setActiveNav("home");

    if ("IntersectionObserver" in window && sections.length > 0) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry) {
                    setActiveNav(visibleEntry.target.dataset.navSection);
                }
            },
            {
                rootMargin: "-30% 0px -55% 0px",
                threshold: [0.15, 0.35, 0.6]
            }
        );

        sections.forEach((section) => {
            navObserver.observe(section);
        });
    }
});
