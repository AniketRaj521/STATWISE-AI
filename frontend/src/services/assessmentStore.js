const STORAGE_KEY = "statwise_latest_assessment";

export function saveAssessmentResult(result) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function getAssessmentResult() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearAssessmentResult() {
  localStorage.removeItem(STORAGE_KEY);
}