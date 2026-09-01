import { stations } from "./data/station-data.js";
import { walkScenarios } from "./data/walk-scenarios.js";
import { loadAppData } from "./actions/storage-actions.js";
import { getLocalDate } from "./actions/visit-actions.js";
import { findStation, renderCandidateScreen, renderHistoryScreen, renderHomeScreen, renderLaunchScreen, renderPointsScreen, renderRecordScreen, renderStationDetailScreen, updateNavigation, updateTotalPoints } from "./actions/view-actions.js";
import { registerAppEvents } from "./events/app-events.js";

const appState = { data: loadAppData(), displayedStationName: "", stations, candidates: [], selectedScenarioId: "", detailOrigin: "candidates" };
const dailyStationStorageKey = "osanpo-record-app-daily-station";

function getTodayRecommendedStation() {
  const today = getLocalDate();
  const savedRecommendation = JSON.parse(localStorage.getItem(dailyStationStorageKey));
  if (savedRecommendation?.date === today && findStation(savedRecommendation.stationName)) return savedRecommendation.stationName;
  const stationName = stations[Math.floor(Math.random() * stations.length)].name;
  localStorage.setItem(dailyStationStorageKey, JSON.stringify({ date: today, stationName }));
  return stationName;
}

function renderScreen(screenName = "home") {
  const screenContainer = document.querySelector("#screen-container");
  const isLaunchScreen = screenName === "launch";
  document.body.classList.toggle("is-launch-screen", isLaunchScreen);
  if (isLaunchScreen) screenContainer.innerHTML = renderLaunchScreen();
  if (screenName === "home") screenContainer.innerHTML = renderHomeScreen();
  if (screenName === "candidates") screenContainer.innerHTML = renderCandidateScreen(walkScenarios.find((scenario) => scenario.id === appState.selectedScenarioId), appState.candidates);
  if (screenName === "detail") screenContainer.innerHTML = renderStationDetailScreen(findStation(appState.displayedStationName), walkScenarios.find((scenario) => scenario.id === appState.selectedScenarioId), appState.detailOrigin || "home");
  if (screenName === "record") screenContainer.innerHTML = renderRecordScreen(appState.displayedStationName, getLocalDate());
  if (screenName === "history") screenContainer.innerHTML = renderHistoryScreen(appState.data.visits);
  if (screenName === "points") screenContainer.innerHTML = renderPointsScreen(appState.data.visits);
  updateTotalPoints(appState.data.visits);
  updateNavigation(screenName);
  history.replaceState(null, "", isLaunchScreen ? "./" : `#${screenName}`);
}

function showMessage(message) {
  document.querySelector("#message-text").textContent = message;
  document.querySelector("#message-dialog").showModal();
}

appState.displayedStationName = getTodayRecommendedStation();
registerAppEvents(appState, renderScreen, showMessage);
renderScreen("launch");