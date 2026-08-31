export function createVisitId() {
  return crypto.randomUUID();
}

export function getLocalDate(value = new Date()) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value - offset).toISOString().slice(0, 10);
}

export function getVisitForStationAndDate(visits, stationName, visitDate) {
  return visits.find((visit) => visit.stationName === stationName && visit.visitDate === visitDate);
}

export function addVisitForStationDate(visits, stationName, visitDate) {
  const existingVisit = getVisitForStationAndDate(visits, stationName, visitDate);
  if (existingVisit) return { visits, visit: existingVisit, addedPoint: false };

  const nextVisit = { id: createVisitId(), stationName, visitDate, memos: [] };
  return { visits: [...visits, nextVisit], visit: nextVisit, addedPoint: true };
}

export function addMemoToVisit(visits, stationName, visitDate, memoText) {
  const existingVisit = getVisitForStationAndDate(visits, stationName, visitDate);
  const memo = { id: createVisitId(), text: memoText.trim(), createdAt: new Date().toISOString() };

  if (existingVisit) {
    existingVisit.memos.push(memo);
    return { visits, visit: existingVisit, addedPoint: false };
  }

  const nextVisit = { id: createVisitId(), stationName, visitDate, memos: [memo] };
  return { visits: [...visits, nextVisit], visit: nextVisit, addedPoint: true };
}

export function deleteVisitById(visits, visitId) {
  return visits.filter((visit) => visit.id !== visitId);
}

export function getStationVisitCount(visits, stationName) {
  return visits.filter((visit) => visit.stationName === stationName).length;
}