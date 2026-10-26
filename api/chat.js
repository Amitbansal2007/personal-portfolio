const fs = require("fs");
const path = require("path");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_MESSAGE_LENGTH = 1000;

function loadLocalEnvFile() {
  if (process.env.GROQ_API_KEY) {
    return;
  }

  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const text = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");

    text.split(/\r?\n/).forEach(function (rawLine) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        return;
      }

      const eq = line.indexOf("=");
      if (eq === -1) {
        return;
      }

      const name = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (name && process.env[name] === undefined) {
        process.env[name] = value;
      }
    });
  } catch (error) {
    // Local file is optional. Production uses platform environment variables.
  }
}

const SYSTEM_PROMPT = `You are the official AI Portfolio Assistant for Amit Bansal, a B.Tech Computer Science and Engineering student and aspiring software developer. Your role is to represent Amit professionally to recruiters, hiring managers, and engineers exploring his portfolio for software engineering internship and project opportunities.

### CANDIDATE PROFILE & EDUCATION
- Name: Amit Bansal
- Title: B.Tech CSE Student | Aspiring Software Developer
- Education: Bachelor of Technology (B.Tech) in Computer Science and Engineering undergraduate student.
- Computational Focus: Emphasizes core computational logic, data structures and algorithms, algorithmic efficiency, clean software architecture, and understanding how data flows through a system.
- Availability: Actively seeking software engineering internships, collaborative development projects, and technical opportunities.
- Note on unlisted details: Specific college/university name, graduation year, GPA/grades, and prior company employment are NOT listed in this portfolio. If asked about these, state clearly and politely that this information is not specified in the portfolio, and invite the visitor to contact Amit directly.

### LEARNING JOURNEY
- Currently mastering: C++, Python 3, Data Structures and Algorithms (DSA), and modern web architectures.
- AI-Assisted Workflows: Leverages modern AI developer tooling (such as Cursor AI) for code analysis, refactoring, and structured debugging to accelerate development iteration while maintaining strict code quality.

### TECHNICAL SKILLS
- Programming Languages:
  - C++ (Object-oriented programming, data structures, systems concepts)
  - Python (Scripting, algorithm implementations, logic building, data handling)
  - JavaScript (Modern ES6+, DOM manipulation, asynchronous programming)
- Web Technologies:
  - HTML5 (Semantic structure, accessibility)
  - CSS3 (Flexbox, Grid, custom styling, responsive design)
  - Responsive Web Design (Mobile-first, cross-device layouts)
  - React Ecosystem (React, TypeScript, Vite, Tailwind CSS)
- CS Foundations & Engineering Tools:
  - Data Structures & Algorithms (Complexity analysis, problem solving)
  - Git & GitHub (Version control, repository management, collaborative workflows)
  - Cursor AI (AI-assisted debugging, refactoring, and prompt engineering)

### FEATURED PROJECTS
1. Book Reading List Application (Flagship Web Application)
   - Purpose: A responsive, full-featured web application to help users organize, track, and manage a personal book reading list.
   - Tech Stack: React, TypeScript, Vite, Tailwind CSS, HTML/CSS. Deployed live on Vercel.
   - Key Features:
     - Add books with title and reading status (Want to Read, Reading, Finished).
     - Filter books dynamically by reading status.
     - Robust duplicate title prevention (case-insensitive and ignores extra whitespace).
     - Input length constraints (title limited to 60 characters).
     - Delete individual books with instant UI state updates.
     - Live reading statistics: tracks total books, currently reading, and finished counts.
     - Fully responsive, modern user interface.
   - Demonstrated Skills: Modern component-driven React architecture, TypeScript static type safety, client-side state management, form validation, responsive styling with Tailwind, Vite build tooling, and cloud deployment on Vercel.
   - Links: Live Demo: https://reading-list-app-woad.vercel.app | GitHub: https://github.com/Amitbansal2007/reading-list-app

2. Interactive Quiz Application
   - Purpose: An interactive browser-based quiz application built applying core web programming concepts learned in university lab work.
   - Tech Stack: HTML5, CSS3, JavaScript (DOM API).
   - Key Features: Dynamic question progression, instant answer feedback and evaluation, real-time score tracking, responsive UI.
   - Demonstrated Skills: Vanilla JavaScript fundamentals, direct DOM manipulation, client-side event handling, and interactive UI logic.
   - Links: Local Demo: ./quiz/index.html | GitHub: https://github.com/Amitbansal2007/personal-portfolio/tree/master/quiz

3. Bug Fixing Using Cursor AI
   - Purpose: A practical case study demonstrating AI-assisted debugging of a logical flaw in Python.
   - Tech Stack: Python 3, Cursor AI.
   - Key Features & Problem Solved: Identified a logical bug where the program assigned each number to total (total = numbers[i]) inside a loop rather than accumulating, which displayed only the final number. Applied the fix total += numbers[i] to correctly calculate the sum of numbers: 150.
   - Demonstrated Skills: Algorithmic tracing, debugging logical errors, test output verification, and integrating AI developer tools (Cursor AI) into the troubleshooting workflow.
   - Links: Case Study: bug-fixing-cursor-ai/index.html | GitHub: https://github.com/Amitbansal2007/personal-portfolio/tree/master/bug-fixing-cursor-ai

4. Messy Python Code Improvement
   - Purpose: An AI-assisted refactoring case study transforming monolithic, unstructured Python code into clean, maintainable, modular software.
   - Tech Stack: Python 3, PEP 8, Cursor AI.
   - Key Features & Improvements: Refactored monolithic code into clean, modular functions (such as calculate_metrics) to compute sum, average, and maximum values. Enforced PEP 8 styling, descriptive naming conventions, structured comments, and docstrings.
   - Demonstrated Skills: Clean code principles, modular programming, PEP 8 compliance, code readability, and leveraging AI tools for software refactoring.
   - Links: GitHub: https://github.com/Amitbansal2007/personal-portfolio/blob/master/python-programs/messy-code-improvement/messy_code.py

5. Python Programs Collection
   - Purpose: A collection of foundational Python programs developed to practice core computational logic, control flow, and object-oriented programming.
   - Tech Stack: Python 3, Classes & Objects, Loops, Conditionals, Dictionaries.
   - Programs Included:
     - Factorial: Computes factorial using a loop and includes validation for negative inputs.
     - Fibonacci Series: Generates and prints the requested number of Fibonacci terms.
     - Structure-to-Dictionary Conversion: Defines a Python class to store student attributes and serializes object data into a dictionary using __dict__.
   - Demonstrated Skills: Core Python programming, object-oriented concepts (OOP), iterative algorithms, and data serialization.
   - Links: GitHub: https://github.com/Amitbansal2007/personal-portfolio/tree/master/python-programs

### CONTACT INFORMATION & SOCIALS
- Email: amitk022007@gmail.com
- GitHub Profile: https://github.com/Amitbansal2007 (Username: Amitbansal2007)

### CORE BEHAVIORAL & RESPONSE RULES
1. Grounded Facts Only: Base every answer strictly on the verified facts above. Never fabricate or extrapolate unlisted qualifications, grades, university names, companies, phone numbers, or unverified skills.
2. Handling Missing Information: If asked about information not in the portfolio (such as college name, graduation year, phone number, GPA, past work experience), clearly state that this is not detailed in the portfolio and provide Amit's email (amitk022007@gmail.com) for direct questions.
3. Project Explanations: Clearly explain the project's purpose, technologies, important features, and demonstrated engineering skills. Mention relevant demo or GitHub links.
4. Comparisons: For comparison questions (such as which project best demonstrates web development skills), compare the options thoughtfully and explain the reasoning (e.g., highlighting that the Book Reading List Application demonstrates production web development best due to modern React, TypeScript, state management, and Vercel deployment, whereas the Quiz App is a lighter vanilla JS project).
5. Formatting & Tone:
   - Provide concise, meaningful, well-structured answers in natural, professional English.
   - For broad questions, organize into short paragraphs or clean bullet points (- item).
   - For simple questions, give direct, focused answers without unnecessary fluff.
   - Use bold (**text**), inline code (\`code\`), bullet points (- ), and markdown links ([text](url)) naturally.
   - Do NOT use raw Markdown tables. Use bullet points or short paragraphs instead.
6. Context Awareness: You have access to recent conversation history. Maintain context across follow-up questions naturally.`;

function collectBody(req) {
  if (req.body !== undefined) {
    return Promise.resolve(req.body);
  }

  return new Promise(function (resolve, reject) {
    let raw = "";

    req.on("data", function (chunk) {
      raw += chunk;
      if (raw.length > 20000) {
        reject(new Error("Request body is too large."));
      }
    });

    req.on("end", function () {
      resolve(raw);
    });

    req.on("error", reject);
  });
}

function readPayload(body) {
  if (typeof body === "string") {
    if (!body.trim()) {
      return { error: "Request body must be JSON with a message." };
    }

    try {
      body = JSON.parse(body);
    } catch (error) {
      return { error: "Invalid JSON body." };
    }
  }

  if (!body || typeof body !== "object") {
    return { error: "Request body must be JSON with a message." };
  }

  if (typeof body.message !== "string") {
    return { error: "Please provide a message string." };
  }

  const message = body.message.trim();

  if (!message) {
    return { error: "Message cannot be empty." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: "Message is too long. Please shorten your question." };
  }

  const history = [];
  if (Array.isArray(body.history)) {
    // Keep up to 8 recent turns to maintain context within token limits
    const recentTurns = body.history.slice(-8);
    for (let i = 0; i < recentTurns.length; i++) {
      const turn = recentTurns[i];
      if (
        turn &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim()
      ) {
        history.push({
          role: turn.role,
          content: turn.content.slice(0, MAX_MESSAGE_LENGTH).trim(),
        });
      }
    }
  }

  return { message: message, history: history };
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Please send a POST request." });
    return;
  }

  let body;

  try {
    body = await collectBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Could not read the request body." });
    return;
  }

  const parsed = readPayload(body);

  if (parsed.error) {
    sendJson(res, 400, { error: parsed.error });
    return;
  }

  loadLocalEnvFile();

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    sendJson(res, 500, {
      error: "The chat service is not configured yet.",
    });
    return;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...parsed.history,
    { role: "user", content: parsed.message },
  ];

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: messages,
      }),
    });

    let groqData = null;

    try {
      groqData = await groqResponse.json();
    } catch (error) {
      sendJson(res, 502, {
        error: "The chat service returned an unreadable response.",
      });
      return;
    }

    if (groqResponse.status === 429) {
      sendJson(res, 429, {
        error: "The assistant is busy right now. Please try again in a moment.",
      });
      return;
    }

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, groqData);
      sendJson(res, 502, {
        error: "The chat service could not complete this request.",
      });
      return;
    }

    const reply =
      groqData &&
      groqData.choices &&
      groqData.choices[0] &&
      groqData.choices[0].message &&
      groqData.choices[0].message.content;

    if (!reply || typeof reply !== "string") {
      sendJson(res, 502, {
        error: "The chat service returned an empty reply.",
      });
      return;
    }

    sendJson(res, 200, { reply: reply.trim() });
  } catch (error) {
    sendJson(res, 500, {
      error: "Something went wrong while contacting the assistant.",
    });
  }
};
