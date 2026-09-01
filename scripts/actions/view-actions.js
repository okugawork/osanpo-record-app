import { stations } from "../data/station-data.js";
import { walkScenarios } from "../data/walk-scenarios.js";
import { getStationVisitCount } from "./visit-actions.js";

export function findStation(stationName) {
  return stations.find((station) => station.name === stationName);
}

export function renderLaunchScreen() {
  return `<section class="launch-screen" aria-labelledby="launch-title"><div class="launch-content"><p class="launch-kicker">おさんぽ記録</p><h1 id="launch-title">今日は、<br>どこを歩く？</h1><button class="launch-button" id="start-walk" type="button"><span>お散歩を開始</span><b aria-hidden="true">→</b></button></div></section>`;
}

function stationOptions(selectedName) {
  return stations.map((station) => `<option value="${station.name}" ${station.name === selectedName ? "selected" : ""}>${station.name}駅</option>`).join("");
}

function stationCard(station, scenario) {
  return `<article class="station-card ${scenario?.imageClass ?? "scenario-town"}"><div class="station-veil"></div><div class="station-content"><p class="station-kicker">STATION WALK GUIDE</p><h2 class="station-name">${station.name}駅</h2><p class="station-copy">${station.description}</p><div class="tag-list">${station.themes.map((theme) => `<span class="tag">${theme}</span>`).join("")}</div></div><p class="station-meta"><span class="line-mark"></span>${station.lines}</p></article>`;
}

function scenarioCard(scenario) {
  return `<button class="scenario-card ${scenario.imageClass}" data-scenario-id="${scenario.id}" type="button"><span class="scenario-card-veil"></span><span class="scenario-card-content"><span class="scenario-icon" aria-hidden="true">${scenario.id === "nature" ? "♧" : scenario.id === "future-city" ? "▥" : scenario.id === "town-walk" ? "⌁" : "☕"}</span><span><strong>${scenario.title}</strong><small>${scenario.description}</small></span></span><b aria-hidden="true">›</b></button>`;
}

function stationGachaCard() {
  return `<article class="station-gacha-card"><div class="station-gacha-photo"></div><div class="station-gacha-veil"></div><div class="station-gacha-content"><span class="station-gacha-token" aria-hidden="true">✦</span><strong>知らない駅へ、ふらり。</strong><button id="draw-station" type="button">駅ガチャを回す <b aria-hidden="true">→</b></button></div></article>`;
}

function candidateCard(station, index) {
  return `<button class="candidate-card" data-station-name="${station.name}" type="button"><span class="candidate-number">0${index + 1}</span><span><strong>${station.name}駅</strong><small>${station.description}</small><em>${station.themes.slice(0, 2).join("　")}</em></span><b aria-hidden="true">›</b></button>`;
}

function formatDate(dateText) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(`${dateText}T00:00:00`));
}

function formatTime(dateText) {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateText));
}

function visitCard(visit, visits, includeDelete = false) {
  const visitNumber = getStationVisitCount(visits.filter((candidate) => candidate.visitDate <= visit.visitDate), visit.stationName);
  return `<article class="visit-card"><div class="card-header"><div><h3>${visit.stationName}駅</h3><p class="visit-meta">${formatDate(visit.visitDate)} ・ ${visitNumber}回目 ・ +1ポイント</p></div>${includeDelete ? `<button class="danger-button" data-delete-visit-id="${visit.id}" type="button">削除</button>` : ""}</div><ul class="memo-list">${visit.memos.map((memo) => `<li class="memo-item"><span class="memo-time">${formatTime(memo.createdAt)}</span>${memo.text}</li>`).join("")}</ul></article>`;
}

export function renderHomeScreen() {
  return `<section class="screen home-screen"><section class="home-introduction"><div class="home-introduction-veil"></div><div><p>歩く、感じる、つながる。</p><small>東京を、あなたのペースで。</small></div></section><section class="scenario-section" aria-labelledby="scenario-heading"><p class="section-label">TODAY'S WALK</p><h1 id="scenario-heading">今日は、どんな気分？</h1><p class="lead">シチュエーションを選ぶと、散歩に合う駅を紹介します。</p>${stationGachaCard()}<div class="scenario-list">${walkScenarios.map(scenarioCard).join("")}</div></section></section>`;
}

export function renderCandidateScreen(scenario, candidates) {
  return `<section class="screen scenario-screen ${scenario.imageClass}"><section class="scenario-hero"><div class="scenario-hero-veil"></div><button class="hero-back-button" data-screen="home" type="button">‹ 戻る</button><div class="scenario-hero-copy"><p>WALKING SCENE</p><h1>${scenario.title}</h1><span>${scenario.description}</span></div></section><section class="candidate-content"><div class="candidate-heading"><div><p>SELECT A STATION</p><h2>今日の候補駅</h2></div><span>${candidates.length} spots</span></div><p class="lead">気になる駅を選ぶと、散歩のヒントを見られます。</p><section class="candidate-list" aria-label="おすすめ駅">${candidates.map(candidateCard).join("")}</section><button class="secondary-button full-width-button" data-scenario-id="${scenario.id}" type="button">↻ 別の候補を見る</button></section></section>`;
}

export function renderStationDetailScreen(station, scenario, originScreen = "home") {
  const returnLabel = originScreen === "home" ? "‹ ホームへ" : "‹ 候補駅へ";
  return `<section class="screen scenario-screen ${scenario.imageClass}"><section class="detail-hero"><div class="scenario-hero-veil"></div><button class="hero-back-button" data-screen="${originScreen}" type="button">${returnLabel}</button><div class="scenario-hero-copy"><p>STATION WALK GUIDE</p><h1>${station.name}駅</h1><span>${station.lines}</span></div></section><section class="detail-content"><span class="theme-pill">${scenario.title}</span><h2>${scenario.guideTitle.replace("\n", "<br>")}</h2><p class="detail-lead">${scenario.guideDescription}</p><section class="walk-hints"><p>WALKING HINTS</p>${scenario.hints.map(([icon, title, description]) => `<article><span>${icon}</span><div><strong>${title}</strong><small>${description}</small></div></article>`).join("")}</section><button class="primary-button detail-record-button" data-screen="record" type="button">この駅で散歩を始める <span aria-hidden="true">→</span></button></section></section>`;
}

export function renderRecordScreen(selectedStationName, visitDate) {
  return `<section class="screen"><p class="section-label">WALK RECORD</p><h1>今日の散歩を残す</h1><p class="lead">メモを保存すると、その駅の訪問として記録します。</p><form class="content-card" id="memo-form"><label class="form-field">駅<select id="station-select" name="stationName">${stationOptions(selectedStationName)}</select></label><label class="form-field">訪問日<input id="visit-date" name="visitDate" type="date" value="${visitDate}" required /></label><button class="secondary-button" id="record-visit" type="button">訪問を記録（+1）</button><label class="form-field">メモ<textarea name="memoText" maxlength="1000" placeholder="歩いた道、食べたもの、気づいたこと..." required></textarea></label><p class="field-help">同じ駅・同じ日のメモは、同じ訪問回に追加されます。</p><button class="primary-button" type="submit">訪問とメモを保存</button></form></section>`;
}

export function renderHistoryScreen(visits) {
  const sortedVisits = [...visits].sort((first, second) => second.visitDate.localeCompare(first.visitDate));
  return `<section class="screen"><p class="section-label">WALK HISTORY</p><h1>散歩の記録</h1><p class="lead">日付順に、歩いた街と思い出を振り返れます。</p>${sortedVisits.length ? sortedVisits.map((visit) => visitCard(visit, visits, true)).join("") : `<p class="content-card empty-message">まだ訪問記録はありません。</p>`}</section>`;
}

export function renderPointsScreen(visits) {
  const stationCounts = stations.map((station) => ({ name: station.name, count: getStationVisitCount(visits, station.name) })).filter((station) => station.count > 0).sort((first, second) => second.count - first.count || first.name.localeCompare(second.name, "ja"));
  return `<section class="screen"><p class="section-label">WALK POINTS</p><h1>歩いた足あと</h1><div class="content-card point-summary"><strong class="point-number">${visits.length}</strong><span>総訪問ポイント</span></div>${stationCounts.length ? stationCounts.map((station) => `<article class="content-card card-header"><strong>${station.name}駅</strong><span>${station.count}ポイント</span></article>`).join("") : `<p class="content-card empty-message">訪問を記録すると、ここにポイントが表示されます。</p>`}<section class="content-card"><h2>データの保存</h2><p class="field-help">端末変更やブラウザのデータ消去に備えて、記録をJSONファイルに保存できます。</p><div class="button-row"><button class="secondary-button" id="export-data" type="button">書き出す</button><label class="secondary-button" for="import-data">読み込む</label><input id="import-data" type="file" accept="application/json" hidden /></div></section></section>`;
}

export function updateTotalPoints(visits) {
  document.querySelector("#total-points").textContent = `総ポイント ${visits.length}`;
}

export function updateNavigation(screenName) {
  document.querySelectorAll(".navigation-button").forEach((button) => button.classList.toggle("active", button.dataset.screen === screenName));
}