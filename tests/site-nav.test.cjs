const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");

const script = fs.readFileSync(`${__dirname}/../assets/2027/js/site.js`, "utf8");
const ids = ["home", "overview", "format", "schedule", "organizers", "contact"];

function createPage({ scrollY = 0, innerHeight = 900, scrollMargin = 104 } = {}) {
    const tops = [0, 900, 2200, 6200, 7200, 7700];
    const events = {};
    const frames = [];
    const links = ids.map((id) => ({
        dataset: { navLink: id },
        active: false,
        classList: { toggle(name, active) { links[ids.indexOf(id)].active = active; } }
    }));
    const sections = ids.map((id, index) => ({
        dataset: { navSection: id },
        getBoundingClientRect: () => ({ top: tops[index] - window.scrollY })
    }));
    const window = {
        scrollY,
        innerHeight,
        getComputedStyle: () => ({ scrollMarginTop: `${scrollMargin}px` }),
        addEventListener(name, listener) { events[name] = listener; },
        requestAnimationFrame(callback) { frames.push(callback); }
    };
    vm.runInNewContext(script, {
        window,
        document: {
            documentElement: { scrollHeight: 8500 },
            addEventListener(name, listener) { listener(); },
            querySelectorAll: (selector) => selector === "[data-nav-link]" ? links : sections
        }
    });
    return {
        window,
        active: () => links.filter((link) => link.active).map((link) => link.dataset.navLink),
        fire(name) { events[name](); },
        flush() { frames.splice(0).forEach((callback) => callback()); }
    };
}

test("initial navigation follows the current position, including direct anchors", () => {
    for (const [scrollY, expected] of [[0, "home"], [2096, "format"], [6096, "schedule"]]) {
        assert.deepEqual(createPage({ scrollY }).active(), [expected]);
    }
});

test("scrolling in either direction selects each section and keeps long sections active", () => {
    const page = createPage();
    for (const [scrollY, expected] of [
        [796, "overview"], [2096, "format"], [5000, "format"],
        [6096, "schedule"], [7096, "organizers"], [7596, "contact"],
        [7096, "organizers"], [5000, "format"], [796, "overview"], [0, "home"]
    ]) {
        page.window.scrollY = scrollY;
        page.fire("scroll");
        page.flush();
        assert.deepEqual(page.active(), [expected]);
    }
});

test("the last section is active at the bottom even when its anchor cannot reach the top", () => {
    const page = createPage({ scrollY: 7300, innerHeight: 1200 });
    assert.deepEqual(page.active(), ["contact"]);
});

test("mobile scroll offsets, resize, hash navigation, and restored pages update navigation", () => {
    const page = createPage({ scrollMargin: 164, innerHeight: 700 });
    for (const event of ["resize", "hashchange", "load", "pageshow"]) {
        page.window.scrollY = 2036;
        page.fire(event);
        page.flush();
        assert.deepEqual(page.active(), ["format"]);
        page.window.scrollY = 0;
        page.fire("scroll");
        page.flush();
    }
});

