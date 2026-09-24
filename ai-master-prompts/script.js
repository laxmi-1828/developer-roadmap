(function () {
  "use strict";

  var PLATFORM_META = {
    chatgpt: { label: "ChatGPT", desc: "A prompt-optimization system tuned to how ChatGPT follows structure, role and format instructions." },
    gemini:  { label: "Gemini",  desc: "Built around Gemini's strengths \u2014 long context, multimodal detail and Google-workflow awareness." },
    claude:  { label: "Claude",  desc: "Written for Claude's preference for explicit structure, XML-style tags and stated constraints." }
  };

  var HOWTO_STEPS = [
    ["Choose your AI platform", "Pick ChatGPT, Gemini or Claude \u2014 whichever you use most."],
    ["Open the appropriate Master Prompt", "Read it once so you understand what it does."],
    ["Copy the complete Master Prompt", "Use the Copy Prompt button, or copy it from this PDF."],
    ["Add the Master Prompt to your AI platform", "Place it wherever your platform supports saved instructions \u2014 a system/custom instruction, a project instruction, or the first message of a dedicated chat. Exact naming varies by platform and can change, so check your platform's current settings if unsure."],
    ["Save the setup", "So the Master Prompt is ready whenever you need it."],
    ["Return to the saved setup", "Any time you need a new AI prompt, come back to this chat or project."],
    ["Describe what you want", "For example: \u201cCreate a prompt for ChatGPT to help me debug my Laravel project\u201d or \u201cCreate a prompt for Gemini to generate an Instagram Reel script.\u201d"],
    ["Let the Master Prompt do the work", "It will transform your rough request into a structured, useful prompt."],
    ["Copy the generated optimized prompt", "This is the prompt you'll actually use for your task."],
    ["Open a new chat or session", "Paste the optimized prompt into your target AI platform and use it."]
  ];

  var BEST_PRACTICES = [
    "Give enough context.",
    "Clearly explain your goal.",
    "Include errors or examples when relevant.",
    "Mention your technology or framework.",
    "Specify the desired output.",
    "Review AI-generated answers.",
    "Never share passwords, API keys, private credentials, confidential client information, or sensitive personal information."
  ];

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Render prompt viewers ---------- */
  Object.keys(PROMPTS).forEach(function (key) {
    var el = document.getElementById("view-" + key);
    if (el) el.textContent = PROMPTS[key];
  });

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-copy");
      var text = PROMPTS[key];
      var original = btn.textContent;
      function done(ok) {
        btn.textContent = ok ? "\u2713 Copied!" : "Copy failed";
        showToast(ok ? PLATFORM_META[key].label + " prompt copied to clipboard." : "Could not copy automatically \u2014 please select and copy manually.");
        setTimeout(function () { btn.textContent = original; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done(true);
        } catch (e) { done(false); }
      }
    });
  });

  /* ---------- Collapse / expand ---------- */
  document.querySelectorAll("[data-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-toggle");
      var viewer = document.getElementById("view-" + key);
      var collapsed = viewer.classList.toggle("collapsed");
      btn.textContent = collapsed ? "Expand" : "Collapse";
    });
  });

  /* ---------- Search ---------- */
  var searchInput = document.getElementById("promptSearch");
  var searchHint = document.getElementById("searchHint");
  var searchClear = document.getElementById("searchClear");

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function clearHighlights() {
    Object.keys(PROMPTS).forEach(function (key) {
      var el = document.getElementById("view-" + key);
      if (el) el.textContent = PROMPTS[key];
    });
  }

  function runSearch() {
    var q = searchInput.value.trim();
    if (!q) { clearHighlights(); searchHint.textContent = ""; return; }
    var re = new RegExp(escapeRegExp(q), "gi");
    var totalMatches = 0;
    var firstMatchEl = null;
    Object.keys(PROMPTS).forEach(function (key) {
      var text = PROMPTS[key];
      var matches = text.match(re);
      var count = matches ? matches.length : 0;
      totalMatches += count;
      var el = document.getElementById("view-" + key);
      if (!el) return;
      if (count > 0) {
        el.innerHTML = text.replace(re, function (m) { return "<mark>" + m + "</mark>"; });
        if (!firstMatchEl) firstMatchEl = el;
      } else {
        el.textContent = text;
      }
    });
    if (totalMatches === 0) {
      searchHint.textContent = "No matches for \u201c" + q + "\u201d.";
    } else {
      searchHint.textContent = totalMatches + " match" + (totalMatches === 1 ? "" : "es") + " for \u201c" + q + "\u201d.";
      if (firstMatchEl) {
        var section = firstMatchEl.closest("section");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  var searchDebounce;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(runSearch, 220);
  });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    clearHighlights();
    searchHint.textContent = "";
    searchInput.focus();
  });

  /* ---------- PDF generation ---------- */
  function buildPromptPdf(key) {
    var meta = PLATFORM_META[key];
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { showToast("PDF library failed to load \u2014 check your connection."); return null; }
    var doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var margin = 56;
    var contentW = pageW - margin * 2;

    function footer() {
      var pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(140, 140, 140);
        doc.text("AI Master Prompts \u2014 Free Developer Resource", margin, pageH - 28);
        doc.text(String(i) + " / " + pageCount, pageW - margin, pageH - 28, { align: "right" });
      }
    }

    // Cover
    doc.setFillColor(27, 33, 48);
    doc.rect(0, 0, pageW, pageH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("AI Master Prompts", margin, 210);
    doc.setFontSize(20);
    doc.setTextColor(216, 178, 107);
    doc.text(meta.label + " Master Prompt", margin, 246);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(220, 220, 225);
    var descLines = doc.splitTextToSize(meta.desc, contentW - 40);
    doc.text(descLines, margin, 284);
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 170);
    doc.text("Free resource \u2014 aimastermprompts", margin, pageH - 50);

    // Body
    doc.addPage();
    doc.setTextColor(27, 33, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(meta.label + " Master Prompt", margin, 60);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 70, pageW - margin, 70);

    doc.setFont("courier", "normal");
    doc.setFontSize(9.3);
    doc.setTextColor(30, 30, 30);
    var lineHeight = 13;
    var y = 96;
    var rawLines = PROMPTS[key].split("\n");
    rawLines.forEach(function (rawLine) {
      var wrapped = doc.splitTextToSize(rawLine.length ? rawLine : " ", contentW);
      wrapped.forEach(function (ln) {
        if (y > pageH - 60) {
          doc.addPage();
          y = 56;
        }
        doc.text(ln, margin, y);
        y += lineHeight;
      });
    });

    footer();
    return doc;
  }

  function buildHowToPdf() {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { showToast("PDF library failed to load \u2014 check your connection."); return null; }
    var doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var margin = 56;
    var contentW = pageW - margin * 2;
    var y = 0;

    function footer() {
      var pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(140, 140, 140);
        doc.text("AI Master Prompts \u2014 Free Developer Resource", margin, pageH - 28);
        doc.text(String(i) + " / " + pageCount, pageW - margin, pageH - 28, { align: "right" });
      }
    }
    function ensureSpace(needed) {
      if (y + needed > pageH - 60) { doc.addPage(); y = 60; }
    }

    // Cover
    doc.setFillColor(27, 33, 48);
    doc.rect(0, 0, pageW, pageH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("How to Use", margin, 210);
    doc.text("AI Master Prompts", margin, 246);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(220, 220, 225);
    doc.text("A short, beginner-friendly guide to setting up and using the", margin, 286);
    doc.text("ChatGPT, Gemini and Claude Master Prompts.", margin, 302);

    doc.addPage();
    y = 60;
    doc.setTextColor(27, 33, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("What is a Master Prompt?", margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 65);
    var introText = "A Master Prompt is an instruction template you save inside an AI tool so the AI can help you write better prompts. It is not the final answer to every task \u2014 it is a step that turns your rough idea into a clearer, more structured prompt, which you then use for the real task.";
    doc.splitTextToSize(introText, contentW).forEach(function (ln) { ensureSpace(16); doc.text(ln, margin, y); y += 15; });

    y += 10;
    ensureSpace(70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(27, 33, 48);
    doc.text("The workflow", margin, y);
    y += 20;
    var workflowSteps = ["YOUR IDEA", "MASTER PROMPT", "OPTIMIZED PROMPT", "AI TOOL", "BETTER RESULT"];
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setDrawColor(216, 178, 107);
    var wx = margin;
    workflowSteps.forEach(function (step, idx) {
      var w = doc.getTextWidth(step) + 20;
      ensureSpace(30);
      doc.setFillColor(245, 240, 228);
      doc.roundedRect(wx, y - 12, w, 22, 4, 4, "F");
      doc.setTextColor(90, 60, 20);
      doc.text(step, wx + 10, y + 3);
      wx += w + 8;
      if (idx < workflowSteps.length - 1) {
        doc.setTextColor(180, 150, 90);
        doc.text("\u2192", wx, y + 3);
        wx += 16;
      }
      if (wx > pageW - margin - 90 && idx < workflowSteps.length - 1) { wx = margin; y += 34; }
    });
    y += 40;

    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(27, 33, 48);
    doc.text("Step-by-step setup", margin, y);
    y += 22;

    HOWTO_STEPS.forEach(function (step, idx) {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(168, 120, 31);
      doc.text("STEP " + (idx + 1), margin, y);
      y += 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(27, 33, 48);
      doc.splitTextToSize(step[0], contentW).forEach(function (ln) { ensureSpace(15); doc.text(ln, margin, y); y += 14; });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 75);
      doc.splitTextToSize(step[1], contentW).forEach(function (ln) { ensureSpace(14); doc.text(ln, margin, y); y += 13; });
      y += 10;
    });

    y += 10;
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(27, 33, 48);
    doc.text("Best practices", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.3);
    doc.setTextColor(60, 60, 65);
    BEST_PRACTICES.forEach(function (bp) {
      doc.splitTextToSize("\u2022 " + bp, contentW - 10).forEach(function (ln, i) {
        ensureSpace(15);
        doc.text(ln, margin + (i === 0 ? 0 : 10), y);
        y += 14;
      });
      y += 2;
    });

    footer();
    return doc;
  }

  function getPdf(key) {
    if (key === "howto") return buildHowToPdf();
    return buildPromptPdf(key);
  }

  function filenameFor(key) {
    if (key === "howto") return "how-to-use-ai-master-prompts.pdf";
    return "ai-master-prompt-" + key + ".pdf";
  }

  document.querySelectorAll("[data-pdf]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-pdf");
      var original = btn.textContent;
      btn.textContent = "Preparing\u2026";
      setTimeout(function () {
        try {
          var doc = getPdf(key);
          if (doc) {
            doc.save(filenameFor(key));
            showToast((key === "howto" ? "How to Use" : PLATFORM_META[key].label) + " PDF downloaded.");
          }
        } catch (e) {
          showToast("Could not generate the PDF. Please try again.");
        }
        btn.textContent = original;
      }, 10);
    });
  });

  var downloadAllBtn = document.getElementById("downloadAll");
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", function () {
      var keys = ["chatgpt", "gemini", "claude", "howto"];
      downloadAllBtn.textContent = "Preparing all four\u2026";
      var i = 0;
      function next() {
        if (i >= keys.length) { downloadAllBtn.textContent = "Download all PDFs"; showToast("All four PDFs downloaded."); return; }
        var key = keys[i++];
        var doc = getPdf(key);
        if (doc) doc.save(filenameFor(key));
        setTimeout(next, 350);
      }
      setTimeout(next, 10);
    });
  }
})();