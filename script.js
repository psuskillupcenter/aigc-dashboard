async function loadDashboard() {
  try {
    const response = await fetch("data.json?version=" + new Date().getTime());

    if (!response.ok) {
      throw new Error("Cannot load data.json");
    }

    const data = await response.json();

    renderKPIs(data.overview || {});
    renderCompetencyChart(data.competency || []);
    renderDevelopmentChart(data.developmentArea || []);
    renderGroupChart("assessmentGroupChart", data.groups?.assessment || []);
    renderGroupChart("learningGroupChart", data.groups?.learning || []);
    renderLearningChart(data.learning || []);
    renderThemeChart("keyLearningChart", data.themes?.keyLearning || []);
    renderThemeChart("applicationChart", data.themes?.application || []);
    renderThemeChart("futureLearningChart", data.themes?.futureLearning || []);
    renderAIInsight(data.aiInsight || {});
    renderRecommendations(data.recommendations || []);

  } catch (error) {
    console.error("Dashboard loading error:", error);
    showError(error.message);
  }
}

function formatNumber(value) {
  const numberValue = Number(value);

  if (!isNaN(numberValue)) {
    return numberValue.toLocaleString("en-US", {
      maximumFractionDigits: 2
    });
  }

  return value || "-";
}

function renderKPIs(overview) {
  const container = document.getElementById("kpiCards");
  container.innerHTML = "";

  const entries = Object.entries(overview);

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-message">No KPI data available.</div>`;
    return;
  }

  entries.forEach(([label, item]) => {
    const card = document.createElement("div");
    card.className = "kpi-card";

    card.innerHTML = `
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${formatNumber(item.value)}</div>
      <div class="kpi-desc">${item.description || ""}</div>
    `;

    container.appendChild(card);
  });
}

function renderCompetencyChart(items) {
  createBarChart("competencyChart", items, "Average Score");
}

function renderDevelopmentChart(items) {
  const ctx = document.getElementById("developmentChart");

  if (!items || items.length === 0) {
    showEmptyCanvasMessage("developmentChart", "No development area data.");
    return;
  }

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        data: items.map(item => Number(item.value)),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

function renderLearningChart(items) {
  const selectedLabels = [
    "Average Before Level",
    "Average After Level",
    "Average Improvement",
    "Improved Learners (%)"
  ];

  const filtered = items.filter(item => selectedLabels.includes(item.label));

  createBarChart("learningChart", filtered, "Value");
}

function renderGroupChart(canvasId, items) {
  createBarChart(canvasId, items, "Participants");
}

function renderThemeChart(canvasId, items) {
  const ctx = document.getElementById(canvasId);

  if (!items || items.length === 0) {
    showEmptyCanvasMessage(canvasId, "No theme data.");
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        label: "Theme Mentions",
        data: items.map(item => Number(item.value)),
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

function createBarChart(canvasId, items, datasetLabel) {
  const ctx = document.getElementById(canvasId);

  if (!items || items.length === 0) {
    showEmptyCanvasMessage(canvasId, "No data available.");
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        label: datasetLabel,
        data: items.map(item => Number(item.value)),
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${datasetLabel}: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderAIInsight(aiInsight) {
  const container = document.getElementById("aiInsight");
  container.innerHTML = "";

  const entries = Object.entries(aiInsight);

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-message">No AI insight available.</div>`;
    return;
  }

  entries.forEach(([label, item]) => {
    const block = document.createElement("div");
    block.className = "insight-block";

    block.innerHTML = `
      <div class="insight-title">${label}</div>
      <p>${item.value || ""}</p>
    `;

    container.appendChild(block);
  });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";

  if (!recommendations || recommendations.length === 0) {
    container.innerHTML = `<div class="empty-message">No recommendations available.</div>`;
    return;
  }

  recommendations.forEach(item => {
    const div = document.createElement("div");
    div.className = "recommendation-item";
    div.textContent = item.value || "";
    container.appendChild(div);
  });
}

function showEmptyCanvasMessage(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  const parent = canvas.parentElement;
  parent.innerHTML = `<div class="empty-message">${message}</div>`;
}

function showError(message) {
  const main = document.querySelector("main");
  main.innerHTML += `
    <section class="note-card">
      <strong>Dashboard loading error</strong>
      <p>${message}</p>
      <p>โปรดตรวจสอบไฟล์ data.json ว่ามีข้อมูลถูกต้องหรือไม่</p>
    </section>
  `;
}

loadDashboard();
