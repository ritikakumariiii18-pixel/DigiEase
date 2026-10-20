
(() => {
    if (window.__digieaseInstalled) return;
    window.__digieaseInstalled = true;

    const STYLE_ID = "digiease-accessibility-styles";
    const RULER_ID = "digiease-reading-ruler";
    let rulerEnabled = false;

    function getStyleElement() {
        let style = document.getElementById(STYLE_ID);

        if (!style) {
            style = document.createElement("style");
            style.id = STYLE_ID;
            (document.head || document.documentElement).appendChild(style);
        }

        return style;
    }

    function removeRuler() {
        document.getElementById(RULER_ID)?.remove();
        rulerEnabled = false;
        document.removeEventListener("mousemove", moveRuler);
    }

    function moveRuler(event) {
        const ruler = document.getElementById(RULER_ID);
        if (ruler) ruler.style.top = `${event.clientY}px`;
    }

    function createRuler() {
        if (document.getElementById(RULER_ID)) return;

        const ruler = document.createElement("div");
        ruler.id = RULER_ID;

        Object.assign(ruler.style, {
            position: "fixed",
            left: "0",
            right: "0",
            top: "50vh",
            height: "36px",
            transform: "translateY(-50%)",
            borderTop: "2px solid #00a982",
            borderBottom: "2px solid #00a982",
            background: "rgba(145, 242, 213, 0.16)",
            pointerEvents: "none",
            zIndex: "2147483647"
        });

        document.documentElement.appendChild(ruler);
        rulerEnabled = true;
        document.addEventListener("mousemove", moveRuler);
    }

    function applySettings(settings) {
        const scale = Number(settings.fontSize) / 100;
        const spacing = Number(settings.lineSpacing);
        const style = getStyleElement();

        // Magnify the webpage and set line spacing for text elements.
        style.textContent = `
      html {
        zoom: ${scale} !important;
      }

      body :is(
        p, h1, h2, h3, h4, h5, h6,
        li, label, blockquote, figcaption,
        td, th, summary, a, button,
        input, textarea, select, span,
        div
      ) {
        line-height: ${spacing} !important;
      }

      ${settings.contrast === "high" ? `
        html {
          filter: contrast(1.5) !important;
        }
      ` : ""}

      ${settings.contrast === "invert" ? `
        html {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        img, video, canvas, iframe {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      ` : ""}
    `;

        if (settings.ruler) {
            createRuler();
        } else {
            removeRuler();
        }
    }


    function getReadablePageText() {
        let paragraphs = [];

        // Special handling for Wikipedia articles.
        const wikiArticle = document.querySelector(
            "#mw-content-text .mw-parser-output"
        );

        if (wikiArticle) {
            const clone = wikiArticle.cloneNode(true);

            clone.querySelectorAll([
                "nav",
                "header",
                "footer",
                "aside",
                "table",
                "figure",
                "sup.reference",
                ".reference",
                ".reflist",
                ".mw-editsection",
                ".toc",
                ".navbox",
                ".metadata",
                ".mw-empty-elt",
                "script",
                "style"
            ].join(",")).forEach(el => el.remove());

            paragraphs = Array.from(clone.querySelectorAll("p"))
                .map(p => p.innerText.replace(/\s+/g, " ").trim())
                .filter(text => text.length > 30);
        } else {
            // General websites: prefer the main reading area.
            const main = document.querySelector(
                "article, main, [role='main']"
            ) || document.body;

            const clone = main.cloneNode(true);

            clone.querySelectorAll([
                "nav", "header", "footer", "aside", "button",
                "input", "select", "textarea", "script", "style",
                "[role='navigation']", "[role='complementary']",
                "[role='search']"
            ].join(",")).forEach(el => el.remove());

            paragraphs = Array.from(clone.querySelectorAll("p"))
                .map(p => p.innerText.replace(/\s+/g, " ").trim())
                .filter(text => text.length > 30);

            // If this page has no paragraph elements, use its main text.
            if (paragraphs.length === 0) {
                const text = (clone.innerText || "")
                    .replace(/\s+/g, " ")
                    .trim();

                return text.slice(0, 15000);
            }
        }

        // Keep complete paragraphs and their original order.
        let result = "";

        for (const paragraph of paragraphs) {
            if (result.length + paragraph.length + 2 > 15000) break;
            result += (result ? "\n\n" : "") + paragraph;
        }

        return result.trim();
    }


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "DIGIEASE_APPLY") {
            try {
                applySettings(message.settings);
                sendResponse({ ok: true });
            } catch (error) {
                sendResponse({ ok: false });
            }
            return true;
        }


        if (message.type === "DIGIEASE_GET_TEXT") {
            const pageText = getReadablePageText();
            sendResponse({ text: pageText });
            return true;
        }

    });


    // Restore saved preferences when a webpage loads.
    chrome.storage.local.get("digieaseSettings", (result) => {
        if (result.digieaseSettings) {
            applySettings(result.digieaseSettings);
        }
  
    });
})();
