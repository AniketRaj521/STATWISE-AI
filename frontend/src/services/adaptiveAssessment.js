// ============================================================
// STATWISE AI - FRONTEND ADAPTIVE ASSESSMENT ENGINE
// ============================================================

export const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

// ------------------------------------------------------------
// NORMALIZE DIFFICULTY
// ------------------------------------------------------------

export function normalizeDifficulty(value) {
  const difficulty = String(value || "")
    .trim()
    .toLowerCase();

  if (
    difficulty === "easy" ||
    difficulty === "beginner" ||
    difficulty === "basic"
  ) {
    return "Beginner";
  }

  if (
    difficulty === "medium" ||
    difficulty === "intermediate" ||
    difficulty === "moderate"
  ) {
    return "Intermediate";
  }

  if (
    difficulty === "hard" ||
    difficulty === "advanced" ||
    difficulty === "difficult"
  ) {
    return "Advanced";
  }

  return "Intermediate";
}

// ------------------------------------------------------------
// GET NEXT DIFFICULTY
// ------------------------------------------------------------

export function getNextDifficulty(
  currentDifficulty,
  isCorrect
) {
  const normalized = normalizeDifficulty(
    currentDifficulty
  );

  const currentIndex =
    DIFFICULTY_LEVELS.indexOf(normalized);

  if (currentIndex === -1) {
    return "Intermediate";
  }

  if (isCorrect) {
    return DIFFICULTY_LEVELS[
      Math.min(
        currentIndex + 1,
        DIFFICULTY_LEVELS.length - 1
      )
    ];
  }

  return DIFFICULTY_LEVELS[
    Math.max(currentIndex - 1, 0)
  ];
}

// ------------------------------------------------------------
// SELECT NEXT QUESTION
// ------------------------------------------------------------

export function selectNextQuestion(
  questions,
  currentDifficulty,
  askedIds = [],
  preferredSkill = null
) {
  const availableQuestions = questions.filter(
    (question) =>
      !askedIds.includes(question.question_id)
  );

  if (availableQuestions.length === 0) {
    return null;
  }

  const normalizedDifficulty =
    normalizeDifficulty(currentDifficulty);

  // First preference:
  // skill + difficulty
  if (preferredSkill) {
    const skillAndDifficulty =
      availableQuestions.filter(
        (question) =>
          String(question.skill || "")
            .trim()
            .toLowerCase() ===
            String(preferredSkill)
              .trim()
              .toLowerCase() &&
          normalizeDifficulty(
            question.difficulty
          ) === normalizedDifficulty
      );

    if (skillAndDifficulty.length > 0) {
      return randomQuestion(
        skillAndDifficulty
      );
    }
  }

  // Second preference:
  // difficulty only
  const difficultyQuestions =
    availableQuestions.filter(
      (question) =>
        normalizeDifficulty(
          question.difficulty
        ) === normalizedDifficulty
    );

  if (difficultyQuestions.length > 0) {
    return randomQuestion(
      difficultyQuestions
    );
  }

  // Final fallback
  return randomQuestion(
    availableQuestions
  );
}

// ------------------------------------------------------------
// RANDOM QUESTION
// ------------------------------------------------------------

function randomQuestion(questions) {
  return questions[
    Math.floor(Math.random() * questions.length)
  ];
}

// ------------------------------------------------------------
// CALCULATE SKILL SCORES
// ------------------------------------------------------------

export function calculateSkillScores(answers) {
  const skillStats = {};

  answers.forEach((answer) => {
    const skill = answer.skill || "General";

    if (!skillStats[skill]) {
      skillStats[skill] = {
        total: 0,
        correct: 0,
      };
    }

    skillStats[skill].total += 1;

    if (answer.correct) {
      skillStats[skill].correct += 1;
    }
  });

  const skillScores = {};

  Object.entries(skillStats).forEach(
    ([skill, stats]) => {
      skillScores[skill] =
        stats.total > 0
          ? Math.round(
              (stats.correct / stats.total) *
                100
            )
          : 0;
    }
  );

  return {
    skillStats,
    skillScores,
  };
}

// ------------------------------------------------------------
// FIND WEAKEST SKILL
// ------------------------------------------------------------

export function findWeakestSkill(skillScores) {
  const skills = Object.keys(skillScores);

  if (skills.length === 0) {
    return null;
  }

  return skills.reduce((weakest, skill) => {
    return skillScores[skill] <
      skillScores[weakest]
      ? skill
      : weakest;
  }, skills[0]);
}

// ------------------------------------------------------------
// PRIORITY
// ------------------------------------------------------------

export function getPriority(score) {
  if (score < 40) return "Critical";
  if (score < 60) return "High";
  if (score < 80) return "Medium";
  return "Low";
}

// ------------------------------------------------------------
// AI RECOMMENDATION
// ------------------------------------------------------------

export function getRecommendation(
  skill,
  score
) {
  if (!skill) {
    return "Complete the assessment to generate personalized learning recommendations.";
  }

  if (score < 40) {
    return `${skill} requires immediate foundational learning.`;
  }

  if (score < 60) {
    return `${skill} needs focused practice and guided learning.`;
  }

  if (score < 80) {
    return `${skill} is developing and should be strengthened through intermediate learning.`;
  }

  return `${skill} is performing well. Consider advanced learning to maintain growth.`;
}

// ------------------------------------------------------------
// FINAL ASSESSMENT ANALYSIS
// ------------------------------------------------------------

export function analyzeAssessment(answers) {
  const total = answers.length;

  const correct = answers.filter(
    (answer) => answer.correct
  ).length;

  const wrong = total - correct;

  const overallScore =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  const { skillStats, skillScores } =
    calculateSkillScores(answers);

  const weakestSkill =
    findWeakestSkill(skillScores);

  const weakestScore = weakestSkill
    ? skillScores[weakestSkill]
    : 0;

  return {
    correct,
    wrong,
    unanswered: 0,
    score: overallScore,
    skillStats,
    skillScores,
    weakestSkill,
    weakestScore,
    priority: getPriority(
      weakestScore
    ),
    recommendation:
      getRecommendation(
        weakestSkill,
        weakestScore
      ),
  };
}