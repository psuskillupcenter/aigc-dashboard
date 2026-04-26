let charts = [];

async function loadDashboard() {
  try {
    const res = await fetch("executive-data.json?v=" + Date.now());
    if (!res.ok) throw new Error("Cannot load executive-data.json");

    const data = await res.json();

    clearCharts();

    renderSnapshot(data.snapshot || []);
    renderFramework(data.framework || []);
    renderCompetency(data.competency || []);
    renderGroups("assessmentGroupChart", data.groups?.assessment || [], "Assessment Records");
    renderGroups("learningGroupChart", data.groups?.learning || [], "Learning Records");
    renderLearning(data.learning || []);
    renderDevelopment(data.development || []);
    renderTheme("keyLearningChart", data.themes?.keyLearning || []);
    renderTheme("applicationChart", data.themes?.application || []);
    renderTheme("futureLearningChart", data.themes?.futureLearning || []);
    renderTexts("insightList", data.insights || []);
    renderTexts("recommendationList", data.recommendations || []);
  } catch (err) {
    console.error(err);
    document.querySelector(".main").innerHTML += `
      <div class="panel">
        <div class="panel-title">Dashboard Error</div>
        <p>${err.message}</p>
        <p>โปรดตรวจสอบไฟล์ executive-data.json</p>
      </div>
    `;
  }
}

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function num(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function format(v) {
  const n = Number(v);
  if (!isNaN(n)) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return v || "-";
}

function colors() {
  return ["#2f80ed", "#8b5cf6", "#37d399", "#ff9f43", "#39d5ff"];
}

function renderSnapshot(items) {
  const el = document.getElementById("snapshotCards");
  el.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "snapshot-card";
    card.innerHTML = `
      <div class="snapshot-label">${item.label}</div>
      <div class="snapshot-value">${format(item.value)}</div>
      <div class="snapshot-sub">${item.sub_value || ""}</div>
    `;
    el.appendChild(card);
  });
}

function renderFramework(items) {
  const el = document.getElementById("frameworkCards");
  el.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "framework-card";
    card.innerHTML = `
      <div class="framework-label">${item.label}</div>
      <div class="framework-value">${format(item.value)}</div>
      <div class="framework-sub">${item.sub_value || ""}</div>
    `;
    el.appendChild(card);
  });
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#334155"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#475569" },
        grid: { color: "rgba(148, 163, 184, 0.25)" }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#475569" },
        grid: { color: "rgba(148, 163, 184, 0.25)" }
      }
    }
  };
}

function renderCompetency(items) {
  const ctx = document.getElementById("competencyChart");

  const chart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: "Average Score",
        data: items.map(i => num(i.value)),
        backgroundColor: "rgba(47, 128, 237, 0.20)",
        borderColor: "#2f80ed",
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#ffffff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#334155" }
        }
      },
      scales: {
        r: {
          pointLabels: { color: "#334155", font: { size: 12 } },
          ticks: { backdropColor: "transparent", color: "#64748b" },
          grid: { color: "rgba(148, 163, 184, 0.35)" },
          angleLines: { color: "rgba(148, 163, 184, 0.35)" }
        }
      }
    }
  });

  charts.push(chart);
}

function renderGroups(canvasId, items, label) {
  const ctx = document.getElementById(canvasId);

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label,
        data: items.map(i => num(i.value)),
        backgroundColor: colors(),
        borderRadius: 12
      }]
    },
    options: chartOptions()
  });

  charts.push(chart);
}

function renderLearning(items) {
  const canvas = document.getElementById("learningChart");

  const selectedLabels = [
    "Average Before Level",
    "Average After Level",
    "Average Improvement"
  ];

  const filtered = items.filter(i => selectedLabels.includes(i.label));

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: filtered.map(i => i.label),
      datasets: [{
        label: "Value",
        data: filtered.map(i => num(i.value)),
        backgroundColor: ["#2f80ed", "#37d399", "#8b5cf6"],
        borderRadius: 12
      }]
    },
    options: chartOptions()
  });

  charts.push(chart);
}

function renderDevelopment(items) {
  const ctx = document.getElementById("developmentChart");

  const chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data: items.map(i => num(i.value)),
        backgroundColor: colors(),
        borderWidth: 3,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#334155" }
        }
      }
    }
  });

  charts.push(chart);
}

function renderTheme(canvasId, items) {
  const ctx = document.getElementById(canvasId);

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: "Mentions",
        data: items.map(i => num(i.value)),
        backgroundColor: "#2f80ed",
        borderRadius: 10
      }]
    },
    options: {
      ...chartOptions(),
      indexAxis: "y"
    }
  });

  charts.push(chart);
}

function renderTexts(containerId, items) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "text-item";
    div.innerHTML = `
      <h4>${item.label}</h4>
      <p>${item.value}</p>
    `;
    el.appendChild(div);
  });
}

loadDashboard();
