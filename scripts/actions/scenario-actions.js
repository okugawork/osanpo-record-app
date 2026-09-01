export function getScenarioCandidates(stations, scenario, maximumCount = 3) {
  const matchingStations = stations.filter((station) => station.themes.some((theme) => scenario.themes.includes(theme)));
  return [...matchingStations]
    .sort(() => Math.random() - .5)
    .slice(0, Math.min(maximumCount, matchingStations.length));
}