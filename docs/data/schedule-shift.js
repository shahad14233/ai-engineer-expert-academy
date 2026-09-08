(function () {
  "use strict";

  const data = window.AcademyData;
  if (!data || !Array.isArray(data.schedule)) return;

  // Compressed plan: start one month later, but still finish before the exam.
  // Some study days intentionally contain two shorter sessions.
  const dateGroups = [
    ["2026-10-11", [1,2]], ["2026-10-12", [3,4]], ["2026-10-13", [5,6]],
    ["2026-10-14", [7,8]], ["2026-10-15", [9,10]], ["2026-10-17", [11,12]],

    ["2026-10-18", [13,14]], ["2026-10-19", [15,16]], ["2026-10-20", [17,18]],
    ["2026-10-21", [19,20]], ["2026-10-22", [21,22]], ["2026-10-24", [23,24]],

    ["2026-10-25", [25]], ["2026-10-26", [26,27]], ["2026-10-27", [28]], ["2026-10-28", [29,30]],

    ["2026-10-29", [31]], ["2026-10-31", [32,33]], ["2026-11-01", [34]],
    ["2026-11-02", [35,36]], ["2026-11-03", [37]], ["2026-11-04", [38,39]],
    ["2026-11-05", [40]], ["2026-11-07", [41,42]], ["2026-11-08", [43]],
    ["2026-11-09", [44,45]], ["2026-11-10", [46]], ["2026-11-11", [47,48]],

    ["2026-11-12", [49]], ["2026-11-14", [50,51]], ["2026-11-15", [52]],
    ["2026-11-16", [53,54]], ["2026-11-17", [55]], ["2026-11-18", [56,57]],
    ["2026-11-19", [58]], ["2026-11-21", [59,60]],

    ["2026-11-22", [61]], ["2026-11-23", [62]], ["2026-11-24", [63]],
    ["2026-11-25", [64]], ["2026-11-26", [65,66]],

    ["2026-11-28", [67,68]], ["2026-11-29", [69,70]], ["2026-11-30", [71,72]],
    ["2026-12-01", [73,74]], ["2026-12-02", [75]], ["2026-12-03", [76,77]],
    ["2026-12-04", [78]]
  ];

  const byId = new Map(data.schedule.map(s => [s.id, s]));
  const dayName = iso => new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

  dateGroups.forEach(([date, ids]) => {
    ids.forEach(id => {
      const session = byId.get(id);
      if (!session) return;
      session.date = date;
      session.day = dayName(date);
      session.heavy = session.day === "Saturday";
      session.finalReview = id === 78;

      const intensive = date >= "2026-11-15";
      if (id === 78) session.duration = 60;
      else if (session.day === "Saturday") session.duration = intensive ? 120 : 90;
      else if (session.day === "Thursday") session.duration = intensive ? 60 : 45;
      else session.duration = intensive ? 75 : 60;
    });
  });

  const phases = {
    D1: "11 Oct – 17 Oct",
    D2: "18 Oct – 24 Oct",
    D3: "25 Oct – 28 Oct",
    D4: "29 Oct – 11 Nov",
    D5: "12 Nov – 21 Nov",
    D6: "22 Nov – 26 Nov",
    D7: "28 Nov – 4 Dec"
  };

  Object.entries(phases).forEach(([id, phase]) => {
    if (data.domains && data.domains[id]) data.domains[id].phase = phase;
  });

  data.studyStart = "2026-10-11";
  data.studyEnd = "2026-12-04";
  data.compressedSchedule = true;

  function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function formatDate(iso) {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));
  }

  function enhanceCompressedDashboard() {
    const route = location.hash || "#/dashboard";
    if (route !== "#/dashboard" && route !== "#" && route !== "") return;

    const intro = document.querySelector(".page-head p");
    if (intro) intro.textContent = "78 focused chapters compressed from 11 October to 4 December 2026. Some study days contain two shorter sessions; 5 December is exam only.";

    const card = document.querySelector(".today-card");
    if (!card) return;

    const t = todayIso();
    let sessions = data.schedule.filter(s => s.date === t);
    let label = "Today's sessions";

    if (!sessions.length) {
      const next = data.schedule.find(s => s.date > t) || data.schedule[data.schedule.length - 1];
      sessions = data.schedule.filter(s => s.date === next.date);
      label = sessions.length > 1 ? "Next scheduled sessions" : "Next scheduled session";
    }

    const totalMinutes = sessions.reduce((sum, s) => sum + Number(s.duration || 0), 0);
    card.style.gridTemplateColumns = "1fr";
    card.innerHTML = `<div><span class="eyebrow">${label}</span><h2>${sessions.length > 1 ? `${sessions.length} sessions` : `Session ${sessions[0].id}`} · ${formatDate(sessions[0].date)}</h2><p class="muted">${sessions[0].day} · ${totalMinutes} minutes total</p><div class="button-row" style="margin-top:14px">${sessions.map(s => `<a class="button ${s.id === sessions[0].id ? "" : "secondary"}" href="#/lesson/${s.id}">Session ${s.id} →</a>`).join("")}</div></div>`;
  }

  window.addEventListener("load", () => setTimeout(enhanceCompressedDashboard, 0));
  window.addEventListener("hashchange", () => setTimeout(enhanceCompressedDashboard, 0));
})();
