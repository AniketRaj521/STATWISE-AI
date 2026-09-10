// ============================================================
// STATWISE AI - COMPETENCY ENGINE
// ============================================================

const clamp = (value, min = 0, max = 100) => {
  return Math.max(min, Math.min(max, Number(value) || 0));
};


// ============================================================
// CALCULATE UPDATED COMPETENCY
// ============================================================

export function calculateUpdatedCompetency({
  previousCompetency = 65.18,
  assessmentScore = 0,
  skillScores = {},
}) {
  const previous = clamp(previousCompetency);

  const assessment = clamp(assessmentScore);

  // Calculate average skill performance
  const skillValues = Object.values(skillScores)
    .map((score) => Number(score))
    .filter((score) => !Number.isNaN(score));

  const skillAverage =
    skillValues.length > 0
      ? skillValues.reduce(
          (sum, score) => sum + score,
          0
        ) / skillValues.length
      : assessment;

  /*
    Competency calculation:

    40% previous competency
    35% assessment performance
    25% skill performance
  */

  const updated =
    previous * 0.4 +
    assessment * 0.35 +
    skillAverage * 0.25;

  return Number(clamp(updated).toFixed(2));
}


// ============================================================
// COMPETENCY LEVEL
// ============================================================

export function getCompetencyLevel(score) {
  const value = clamp(score);

  if (value >= 85) {
    return "Expert";
  }

  if (value >= 70) {
    return "Advanced";
  }

  if (value >= 50) {
    return "Intermediate";
  }

  return "Beginner";
}


// ============================================================
// CALCULATE SKILL GAP
// ============================================================

export function calculateSkillGap(
  currentScore,
  targetScore
) {
  const current = clamp(currentScore);
  const target = clamp(targetScore);

  return Number(
    Math.max(target - current, 0).toFixed(2)
  );
}


// ============================================================
// CALCULATE SKILL STATUS
// ============================================================

export function getSkillStatus(
  currentScore,
  targetScore
) {
  const gap = calculateSkillGap(
    currentScore,
    targetScore
  );

  if (gap <= 0) {
    return "Target Achieved";
  }

  if (gap <= 10) {
    return "Strong";
  }

  if (gap <= 25) {
    return "Developing";
  }

  return "Needs Improvement";
}


// ============================================================
// PRIORITY
// ============================================================

export function getSkillPriority(gap) {
  const value = Number(gap) || 0;

  if (value >= 30) {
    return "Critical";
  }

  if (value >= 20) {
    return "High";
  }

  if (value >= 10) {
    return "Medium";
  }

  return "Low";
}


// ============================================================
// COMPLETE COMPETENCY PROFILE
// ============================================================

export function buildCompetencyProfile({
  previousCompetency = 65.18,
  assessmentScore = 0,
  skillScores = {},
  targetScores = {},
}) {
  const competencyScore =
    calculateUpdatedCompetency({
      previousCompetency,
      assessmentScore,
      skillScores,
    });

  const competencyLevel =
    getCompetencyLevel(
      competencyScore
    );

  const skills = Object.entries(
    skillScores
  ).map(([skill, score]) => {
    const current = clamp(score);

    const target = clamp(
      targetScores[skill] ?? 75
    );

    const gap = calculateSkillGap(
      current,
      target
    );

    return {
      skill,
      current_score: current,
      target_score: target,
      gap,
      status: getSkillStatus(
        current,
        target
      ),
      priority: getSkillPriority(gap),
    };
  });

  return {
    competency_score: competencyScore,

    competency_level: competencyLevel,

    assessment_score: clamp(
      assessmentScore
    ),

    skills,
  };
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const competencyEngine = {
  calculateUpdatedCompetency,
  getCompetencyLevel,
  calculateSkillGap,
  getSkillStatus,
  getSkillPriority,
  buildCompetencyProfile,
};

export default competencyEngine;