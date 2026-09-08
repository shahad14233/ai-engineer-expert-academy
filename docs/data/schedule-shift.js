(function () {
  "use strict";

  const data = window.AcademyData;
  if (!data || !Array.isArray(data.schedule)) return;

  // The public academy study plan now starts about one month later.
  // A 35-day shift preserves every session's original weekday pattern.
  const SHIFT_DAYS = 35;

  data.schedule.forEach((session) => {
    const shifted = new Date(`${session.date}T12:00:00Z`);
    shifted.setUTCDate(shifted.getUTCDate() + SHIFT_DAYS);
    session.date = shifted.toISOString().slice(0, 10);
  });

  const phases = {
    D1: "11 Oct – 24 Oct",
    D2: "25 Oct – 7 Nov",
    D3: "8 Nov – 14 Nov",
    D4: "15 Nov – 5 Dec",
    D5: "6 Dec – 19 Dec",
    D6: "20 Dec – 26 Dec",
    D7: "27 Dec – 8 Jan"
  };

  Object.entries(phases).forEach(([id, phase]) => {
    if (data.domains && data.domains[id]) data.domains[id].phase = phase;
  });

  data.studyStart = "2026-10-11";
  data.studyEnd = "2027-01-08";
})();
