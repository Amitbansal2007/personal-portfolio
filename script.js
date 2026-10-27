import { marked } from "marked";
import DOMPurify from "dompurify";

// 1. Lazy load 3D Hero visualization for optimal initial page load performance
if (document.getElementById("hero-3d-container")) {
  import("./hero3d.js")
    .then(({ initHero3D }) => {
      initHero3D("#hero-3d-container");
    })
    .catch((err) => {
      console.warn("Could not load 3D hero visualization:", err);
    });
}

// 2. Navigation, Scrollspy & Mobile Drawer
const navLinks = document.querySelectorAll(".site-nav .nav-link");
const sections = document.querySelectorAll("header.site-header, main section, #top");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileDrawer = document.getElementById("mobile-drawer");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

// Mobile Drawer Toggle
if (mobileMenuBtn && mobileDrawer) {
  mobileMenuBtn.addEventListener("click", function () {
    const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
    mobileMenuBtn.setAttribute("aria-expanded", String(!isExpanded));
    mobileMenuBtn.classList.toggle("active");
    mobileDrawer.classList.toggle("open");
    mobileDrawer.setAttribute("aria-hidden", String(isExpanded));
  });

  mobileNavLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.classList.remove("active");
      mobileDrawer.classList.remove("open");
      mobileDrawer.setAttribute("aria-hidden", "true");
    });
  });
}

// Scrollspy for active navigation state
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (!id) return;

          navLinks.forEach(function (link) {
            const href = link.getAttribute("href");
            if (href === "#" + id) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { rootMargin: "-25% 0px -65% 0px" }
  );

  document.querySelectorAll("section[id]").forEach(function (sec) {
    sectionObserver.observe(sec);
  });
}

// 3. Theme Toggle (Dark / Light Mode)
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const themeLabel = themeToggle.querySelector(".theme-label");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    } else {
      themeToggle.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    }

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀️" : "🌙";
    }
  });
}

// 4. Project Search & Category Filtering
const projectSearch = document.getElementById("project-search");
const searchClearBtn = document.getElementById("search-clear-btn");
const filterPills = document.querySelectorAll(".filter-pill, .filter-tab-btn");
const projectItems = document.querySelectorAll(".projects-list .project-item");
const projectsCounter = document.getElementById("projects-counter");
const projectsEmpty = document.getElementById("projects-empty");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

let currentCategory = "all";

function filterProjects() {
  const query = projectSearch ? projectSearch.value.toLowerCase().trim() : "";
  let visibleCount = 0;

  if (searchClearBtn) {
    searchClearBtn.hidden = !query;
  }

  projectItems.forEach(function (item) {
    const itemText = item.textContent.toLowerCase();
    const categories = (item.getAttribute("data-categories") || "").toLowerCase();

    const matchesQuery = !query || itemText.includes(query);
    const matchesCategory = currentCategory === "all" || categories.includes(currentCategory);

    if (matchesQuery && matchesCategory) {
      item.style.display = "";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });

  if (projectsCounter) {
    projectsCounter.textContent = "Showing " + visibleCount + " of " + projectItems.length + " Projects";
  }

  if (projectsEmpty) {
    projectsEmpty.hidden = visibleCount > 0;
  }
}

if (projectSearch) {
  projectSearch.addEventListener("input", filterProjects);
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", function () {
    if (projectSearch) {
      projectSearch.value = "";
      filterProjects();
      projectSearch.focus();
    }
  });
}

filterPills.forEach(function (pill) {
  pill.addEventListener("click", function () {
    filterPills.forEach(function (p) { p.classList.remove("active"); });
    pill.classList.add("active");
    currentCategory = pill.getAttribute("data-filter") || "all";
    filterProjects();
  });
});

if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", function () {
    if (projectSearch) projectSearch.value = "";
    currentCategory = "all";
    filterPills.forEach(function (p) {
      if (p.getAttribute("data-filter") === "all") p.classList.add("active");
      else p.classList.remove("active");
    });
    filterProjects();
  });
}

// 5. Copy Email to Clipboard Action
const copyEmailBtn = document.getElementById("copy-email-btn");
const copyEmailText = document.getElementById("copy-email-text");

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", async function () {
    const email = "amitk022007@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      if (copyEmailText) copyEmailText.textContent = "Copied!";
      copyEmailBtn.classList.add("copied");
      setTimeout(function () {
        if (copyEmailText) copyEmailText.textContent = "Copy";
        copyEmailBtn.classList.remove("copied");
      }, 2000);
    } catch (e) {
      // Fallback for clipboard
      const temp = document.createElement("input");
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      if (copyEmailText) copyEmailText.textContent = "Copied!";
      setTimeout(function () {
        if (copyEmailText) copyEmailText.textContent = "Copy";
      }, 2000);
    }
  });
}

// 6. Floating AI Chatbot Assistant
const chatWidget = document.getElementById("chat-widget");
const chatLauncherBtn = document.getElementById("chat-launcher-btn");
const chatCloseBtn = document.getElementById("chat-close-btn");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatMessages = document.getElementById("chat-messages");
const chatStatus = document.getElementById("chat-status");
const chatClearBtn = document.getElementById("chat-clear-btn");
const chatChips = document.querySelectorAll(".chat-chip");

let chatBusy = false;
let conversationHistory = [];
let typingIndicatorBubble = null;

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Configure custom marked renderer
const markdownRenderer = new marked.Renderer();

// Custom heading rendering: Keep heading sizes proportional within the chat widget bubble
markdownRenderer.heading = function ({ text, depth }) {
  const level = depth <= 2 ? 4 : (depth === 3 ? 4 : 5);
  return `<h${level} class="chat-heading chat-h${level}">${text}</h${level}>`;
};

// Custom link rendering: strictly allow safe protocols, add target="_blank", rel="noopener noreferrer", and styling class
markdownRenderer.link = function ({ href, title, text }) {
  const cleanHref = (href || "").trim();
  if (!/^(https?:\/\/|mailto:|#)/i.test(cleanHref)) {
    return text;
  }
  const isMailto = cleanHref.startsWith("mailto:");
  const targetAttr = isMailto ? "" : ' target="_blank" rel="noopener noreferrer"';
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  return `<a href="${cleanHref}"${targetAttr}${titleAttr} class="chat-link">${text}</a>`;
};

// Custom fenced code blocks
markdownRenderer.code = function ({ text, lang }) {
  const langClass = lang ? ` language-${escapeHtml(lang)}` : "";
  return `<pre class="chat-code-block"><code class="chat-code${langClass}">${escapeHtml(text)}</code></pre>`;
};

// Custom inline code spans
markdownRenderer.codespan = function ({ text }) {
  return `<code class="chat-inline-code">${escapeHtml(text)}</code>`;
};

// Custom horizontal rule
markdownRenderer.hr = function () {
  return '<hr class="chat-hr">';
};

// Initialize marked options
marked.use({
  renderer: markdownRenderer,
  gfm: true,
  breaks: true,
});

// Configure DOMPurify hook to ensure all external links are secure
if (typeof DOMPurify !== "undefined" && typeof DOMPurify.addHook === "function") {
  DOMPurify.addHook("afterSanitizeAttributes", function (node) {
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (!href.startsWith("mailto:") && !href.startsWith("#")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
      node.classList.add("chat-link");
    }
  });
}

function renderSafeMarkdown(rawText) {
  if (!rawText) return "";

  try {
    const parsedHtml = marked.parse(rawText);
    const cleanHtml = DOMPurify.sanitize(parsedHtml, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "b", "em", "i", "del", "s", "code", "pre",
        "ul", "ol", "li", "a", "h3", "h4", "h5", "h6",
        "blockquote", "hr", "span"
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class", "title"],
      ALLOW_DATA_ATTR: false,
    });
    return cleanHtml;
  } catch (err) {
    console.error("Markdown rendering error, falling back to safe escaped text:", err);
    return "<p>" + escapeHtml(rawText).replace(/\n/g, "<br>") + "</p>";
  }
}

function scrollChatToBottom(smooth = true) {
  if (!chatMessages) return;
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function addChatMessage(role, text) {
  if (!chatMessages) {
    return;
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + role;

  if (role === "assistant") {
    bubble.innerHTML = renderSafeMarkdown(text);
  } else {
    // User and error messages rendered safely as text
    bubble.textContent = text;
  }

  chatMessages.appendChild(bubble);
  scrollChatToBottom(true);
}

function setChatLoading(isLoading) {
  chatBusy = isLoading;

  if (chatStatus) {
    chatStatus.hidden = !isLoading;
  }

  if (chatSend) {
    chatSend.disabled = isLoading;
  }

  if (chatInput) {
    chatInput.disabled = isLoading;
  }

  if (chatClearBtn) {
    chatClearBtn.disabled = isLoading;
  }

  chatChips.forEach(function (chip) {
    chip.disabled = isLoading;
    if (isLoading) {
      chip.classList.add("is-disabled");
    } else {
      chip.classList.remove("is-disabled");
    }
  });

  // Manage in-stream typing indicator bubble
  if (chatMessages) {
    if (isLoading && !typingIndicatorBubble) {
      typingIndicatorBubble = document.createElement("div");
      typingIndicatorBubble.className = "chat-bubble assistant typing-bubble";
      typingIndicatorBubble.setAttribute("aria-label", "Assistant is thinking...");
      typingIndicatorBubble.innerHTML =
        '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      chatMessages.appendChild(typingIndicatorBubble);
      scrollChatToBottom(true);
    } else if (!isLoading && typingIndicatorBubble) {
      if (typingIndicatorBubble.parentNode) {
        typingIndicatorBubble.parentNode.removeChild(typingIndicatorBubble);
      }
      typingIndicatorBubble = null;
    }
  }
}

async function submitChatMessage(messageText) {
  const message = messageText ? messageText.trim() : "";

  if (!message || chatBusy) {
    return;
  }

  addChatMessage("user", message);
  if (chatInput) {
    chatInput.value = "";
    chatInput.style.height = "auto";
  }
  setChatLoading(true);

  try {
    const payload = {
      message: message,
      history: conversationHistory.slice(-8),
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = {};

    try {
      data = await response.json();
    } catch (parseError) {
      data = {};
    }

    if (!response.ok || !data.reply) {
      const errorMsg =
        data.error ||
        (response.status === 429
          ? "The assistant is busy right now. Please try again in a moment."
          : "Sorry, I could not complete your request. Please try again.");
      addChatMessage("error", errorMsg);
      return;
    }

    // Save successful turn in conversation history for multi-turn context
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: data.reply });

    addChatMessage("assistant", data.reply);
  } catch (networkError) {
    addChatMessage(
      "error",
      "Unable to connect to the assistant. Please check your network connection and try again."
    );
  } finally {
    setChatLoading(false);
    if (chatInput) {
      chatInput.focus();
    }
  }
}

function initChatWelcome() {
  if (chatMessages) {
    chatMessages.innerHTML = "";
    conversationHistory = [];
    addChatMessage(
      "assistant",
      "Hello! I am Amit Bansal's portfolio assistant. You can ask me about his B.Tech CSE education, technical skills (C++, Python, Web Dev, DSA), featured projects, or contact information."
    );
  }
}

// Widget Open / Close / Toggle Management
function openChatWidget(focusInput = true) {
  if (!chatWidget) return;
  chatWidget.classList.add("is-open");
  chatWidget.setAttribute("aria-hidden", "false");
  if (chatLauncherBtn) {
    chatLauncherBtn.setAttribute("aria-expanded", "true");
    chatLauncherBtn.classList.add("is-active");
  }
  scrollChatToBottom(false);
  if (focusInput && chatInput) {
    setTimeout(function () {
      chatInput.focus();
    }, 120);
  }
}

function closeChatWidget() {
  if (!chatWidget) return;
  chatWidget.classList.remove("is-open");
  chatWidget.setAttribute("aria-hidden", "true");
  if (chatLauncherBtn) {
    chatLauncherBtn.setAttribute("aria-expanded", "false");
    chatLauncherBtn.classList.remove("is-active");
    chatLauncherBtn.focus();
  }
}

function toggleChatWidget() {
  if (!chatWidget) return;
  if (chatWidget.classList.contains("is-open")) {
    closeChatWidget();
  } else {
    openChatWidget(true);
  }
}

// Attach Launcher and Close listeners
if (chatLauncherBtn) {
  chatLauncherBtn.addEventListener("click", toggleChatWidget);
}

if (chatCloseBtn) {
  chatCloseBtn.addEventListener("click", closeChatWidget);
}

// Close on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && chatWidget && chatWidget.classList.contains("is-open")) {
    closeChatWidget();
  }
});

// Wire navigation and page triggers for AI Assistant
document.querySelectorAll('a[href="#chatbot"]').forEach(function (trigger) {
  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    openChatWidget(true);
    if (mobileDrawer && mobileDrawer.classList.contains("open") && mobileMenuBtn) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.classList.remove("active");
      mobileDrawer.classList.remove("open");
      mobileDrawer.setAttribute("aria-hidden", "true");
    }
  });
});

if (window.location.hash === "#chatbot") {
  setTimeout(function () {
    openChatWidget(true);
  }, 350);
}

// Initialize welcome message once
if (chatMessages) {
  initChatWelcome();
}

// Clear conversation button
if (chatClearBtn) {
  chatClearBtn.addEventListener("click", function () {
    if (chatBusy) return;
    initChatWelcome();
    if (chatInput) {
      chatInput.value = "";
      chatInput.style.height = "auto";
      chatInput.focus();
    }
  });
}

// Form submit & Enter-to-send (Shift+Enter for newline)
if (chatForm && chatInput) {
  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!chatBusy && chatInput.value.trim()) {
      submitChatMessage(chatInput.value);
    }
  });

  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!chatBusy && chatInput.value.trim()) {
        submitChatMessage(chatInput.value);
      }
    }
  });

  chatInput.addEventListener("input", function () {
    this.style.height = "auto";
    const newHeight = Math.min(this.scrollHeight, 100);
    this.style.height = (newHeight > 36 ? newHeight : 36) + "px";
  });
}

// Chat suggestion chips
chatChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    if (chatBusy) return;
    openChatWidget(false);
    submitChatMessage(chip.textContent.trim());
  });
});

// 7. Scroll reveal animations with accessibility preference check
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".card, .site-footer").forEach(function (el) {
    el.classList.add("reveal-card");
    revealObserver.observe(el);
  });
}

// 8. Subtle 3D tilt interaction for cards on desktop
if (!prefersReduced && window.innerWidth > 768) {
  document.querySelectorAll(".bento-card, .skill-category-card, .project-item, .contact-card").forEach(function (item) {
    item.addEventListener("mousemove", function (e) {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      item.style.transform = "perspective(900px) rotateX(" + (-y * 2.5) + "deg) rotateY(" + (x * 2.5) + "deg) translateY(-3px)";
    });
    item.addEventListener("mouseleave", function () {
      item.style.transform = "";
    });
  });
}