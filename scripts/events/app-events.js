import { exportAppData, importAppData, saveAppData } from "../actions/storage-actions.js";
import { getScenarioCandidates } from "../actions/scenario-actions.js";
import { addMemoToVisit, addVisitForStationDate, deleteVisitById, getLocalDate } from "../actions/visit-actions.js";
import { walkScenarios } from "../data/walk-scenarios.js";

export function registerAppEvents(appState, renderScreen, showMessage) {
  document.addEventListener("click", (event) => {
    if (event.target.closest("#start-walk")) {
      document.body.classList.add("is-opening");
      renderScreen("home");
      setTimeout(() => document.body.classList.remove("is-opening"), 700);
    }

    const navigationButton = event.target.closest("[data-screen]");
    if (navigationButton) renderScreen(navigationButton.dataset.screen);

    const scenarioButton = event.target.closest("[data-scenario-id]");
    if (scenarioButton) {
      const scenario = walkScenarios.find((candidate) => candidate.id === scenarioButton.dataset.scenarioId);
      appState.selectedScenarioId = scenario.id;
      appState.candidates = getScenarioCandidates(appState.stations, scenario);
      renderScreen("candidates");
    }

    const candidateButton = event.target.closest("[data-station-name]");
    if (candidateButton) {
      appState.displayedStationName = candidateButton.dataset.stationName;
      appState.detailOrigin = "candidates";
      renderScreen("detail");
    }

    if (event.target.closest("#draw-station")) {
      const previousStationName = appState.displayedStationName;
      const candidates = appState.stations.filter((station) => station.name !== previousStationName);
      const selectedStation = candidates[Math.floor(Math.random() * candidates.length)];
      const matchingScenarios = walkScenarios.filter((scenario) => selectedStation.themes.some((theme) => scenario.themes.includes(theme)));
      appState.displayedStationName = selectedStation.name;
      appState.selectedScenarioId = matchingScenarios[Math.floor(Math.random() * matchingScenarios.length)].id;
      appState.detailOrigin = "home";
      renderScreen("detail");
    }

    if (event.target.closest("#record-visit")) {
      const stationName = document.querySelector("#station-select").value;
      const visitDate = document.querySelector("#visit-date").value;
      const result = addVisitForStationDate(appState.data.visits, stationName, visitDate);
      if (result.addedPoint) {
        appState.data.visits = result.visits;
        saveAppData(appState.data);
        renderScreen("record");
      }
      showMessage(result.addedPoint ? "訪問ポイントを1追加しました。" : "この駅はすでにこの日の訪問として記録済みです。");
    }

    const deleteButton = event.target.closest("[data-delete-visit-id]");
    if (deleteButton && confirm("この訪問記録とすべてのメモを削除しますか？")) {
      appState.data.visits = deleteVisitById(appState.data.visits, deleteButton.dataset.deleteVisitId);
      saveAppData(appState.data);
      renderScreen("history");
    }

    if (event.target.closest("#export-data")) {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(new Blob([exportAppData(appState.data)], { type: "application/json" }));
      downloadLink.download = `osanpo-record-${getLocalDate()}.json`;
      downloadLink.click();
      URL.revokeObjectURL(downloadLink.href);
    }

    if (event.target.closest("#close-message")) document.querySelector("#message-dialog").close();
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "memo-form") return;
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = addMemoToVisit(appState.data.visits, formData.get("stationName"), formData.get("visitDate"), formData.get("memoText"));
    appState.data.visits = result.visits;
    saveAppData(appState.data);
    renderScreen("history");
    showMessage(result.addedPoint ? "訪問ポイントを1追加し、メモを保存しました。" : "当日の訪問記録にメモを追加しました。");
  });

  document.addEventListener("change", async (event) => {
    if (event.target.id !== "import-data") return;
    try {
      if (!event.target.files[0] || !confirm("現在のすべての記録を読み込むファイルで置き換えますか？")) return;
      appState.data = importAppData(await event.target.files[0].text());
      saveAppData(appState.data);
      renderScreen("points");
      showMessage("記録を読み込みました。");
    } catch (error) {
      showMessage(error.message);
    } finally {
      event.target.value = "";
    }
  });
}