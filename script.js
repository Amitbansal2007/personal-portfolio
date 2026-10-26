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

// 6. AI Chatbot
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
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(text) {
  const codes = [];
  const links = [];

  // 1. Protect inline code spans
  let formatted = text.replace(/`([^`]+)`/g, function (_, code) {
    codes.push("<code>" + code + "</code>");
    return "\x00CODE" + (codes.length - 1) + "\x00";
  });

  // 2. Markdown links: [text](url) - strictly enforce https, http, or mailto protocols
  formatted = formatted.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s"'\)]+)\)/g,
    function (_, linkText, url) {
      const isMail = url.startsWith("mailto:");
      const targetAttr = isMail ? "" : ' target="_blank" rel="noopener noreferrer"';
      links.push('<a href="' + url + '"' + targetAttr + ' class="chat-link">' + linkText + '</a>');
      return "\x00LINK" + (links.length - 1) + "\x00";
    }
  );

  // 3. Standalone URLs (trim trailing punctuation like periods or commas)
  formatted = formatted.replace(
    /(^|[\s(])(https?:\/\/[^\s<>"')]+?)([.,;:!?]?(?:[\s)]|$))/g,
    function (_, prefix, url, suffix) {
      links.push('<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="chat-link">' + url + '</a>');
      return prefix + "\x00LINK" + (links.length - 1) + "\x00" + suffix;
    }
  );

  // 4. Standalone email addresses (trim trailing punctuation)
  formatted = formatted.replace(
    /(^|[\s(])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})([.,;:!?]?(?:[\s)]|$))/g,
    function (_, prefix, email, suffix) {
      links.push('<a href="mailto:' + email + '" class="chat-link">' + email + '</a>');
      return prefix + "\x00LINK" + (links.length - 1) + "\x00" + suffix;
    }
  );

  // 5. Bold: **text** or __text__
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 6. Italic: *text* or _text_
  formatted = formatted.replace(/(^|[\s(])\*([^*\n]+)\*([\s).,!?]|$)/g, "$1<em>$2</em>$3");
  formatted = formatted.replace(/(^|[\s(])_([^_\n]+)_([\s).,!?]|$)/g, "$1<em>$2</em>$3");

  // 7. Restore links and code
  formatted = formatted.replace(/\x00LINK(\d+)\x00/g, function (_, idx) {
    return links[Number(idx)];
  });

  formatted = formatted.replace(/\x00CODE(\d+)\x00/g, function (_, idx) {
    return codes[Number(idx)];
  });

  return formatted;
}

function renderSafeMarkdown(rawText) {
  if (!rawText) return "";

  // Step 1: Escape HTML to strictly prevent XSS
  const safeText = escapeHtml(rawText);
  const lines = safeText.replace(/\r\n/g, "\n").split("\n");

  const htmlBlocks = [];
  let currentList = null;
  let currentParagraphLines = [];

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      const content = currentParagraphLines.join("<br>");
      if (content.trim()) {
        htmlBlocks.push("<p>" + formatInline(content) + "</p>");
      }
      currentParagraphLines = [];
    }
  }

  function flushList() {
    if (currentList) {
      const tag = currentList.type;
      const itemsHtml = currentList.items
        .map(function (item) {
          return "<li>" + formatInline(item) + "</li>";
        })
        .join("");
      htmlBlocks.push("<" + tag + ">" + itemsHtml + "</" + tag + ">");
      currentList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[2]);
    } else if (numberMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numberMatch[2]);
    } else {
      flushList();
      currentParagraphLines.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  return htmlBlocks.join("");
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

if (chatMessages) {
  initChatWelcome();
}

if (chatClearBtn) {
  chatClearBtn.addEventListener("click", function () {
    if (chatBusy) return;
    initChatWelcome();
    if (chatInput) {
      chatInput.value = "";
      chatInput.focus();
    }
  });
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitChatMessage(chatInput.value);
  });
}

// Chat suggestion chips
chatChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    if (chatBusy) return;
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