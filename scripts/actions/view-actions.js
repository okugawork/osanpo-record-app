import { stations } from "../data/station-data.js";
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

function stationCard(station) {
  return `<article class="station-card"><div class="station-veil"></div><div class="station-content"><p class="station-kicker">TODAY'S WALK</p><h2 class="station-name">${station.name}駅</h2><p class="station-copy">${station.description}</p><div class="tag-list">${station.themes.map((theme) => `<span class="tag">${theme}</span>`).join("")}</div></div><p class="station-meta"><span class="line-mark"></span>${station.lines}</p></article>`;
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

export function renderHomeScreen(station) {
  return `<section class="screen home-screen"><p class="section-label">TODAY'S RECOMMENDATION</p><h1>今日は、こんな散歩を。</h1><p class="lead">駅から始まる、小さな発見。</p>${stationCard(station)}<div class="home-actions"><button class="secondary-button" data-screen="record" type="button">この駅を記録する</button><button class="primary-button draw-button" id="draw-station" type="button">別の駅を引く <span aria-hidden="true">→</span></button></div><p class="hint">気分が変わったら、何度でも引き直せます</p></section>`;
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