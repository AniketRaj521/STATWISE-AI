const statwiseAnalysis = {
  // =========================================================
  // EMPLOYEE PROFILE
  // =========================================================
  employee: {
    employee_id: "EMP001",
    name: "Aarav Sharma",
    role: "Statistical Officer",
    department: "Data & Statistics Division",
    experience: 3,
  },

  role: "Statistical Officer",

  // =========================================================
  // OVERALL COMPETENCY
  // =========================================================
  competency: {
    competency_score: 65.18,
    competency_level: "Intermediate",
    confidence: 91,
  },

  // =========================================================
  // SKILL GAP ANALYSIS
  // =========================================================
  skills: [
    {
      skill: "Probability",
      current_score: 38,
      target_score: 80,
      gap: 42,
      priority: "High",
      status: "Needs Improvement",
      reason:
        "Probability is the largest identified competency gap and should be prioritized.",
      recommendation:
        "Complete foundational and intermediate probability courses followed by assessments.",
    },

    {
      skill: "Data Analysis",
      current_score: 58,
      target_score: 75,
      gap: 17,
      priority: "Medium",
      status: "Developing",
      reason:
        "Data analysis skills require further development for stronger analytical performance.",
      recommendation:
        "Practice data cleaning, exploratory analysis and analytical techniques.",
    },

    {
      skill: "Statistics",
      current_score: 82,
      target_score: 85,
      gap: 3,
      priority: "Low",
      status: "Strong",
      reason:
        "Current statistical competency is already close to the target level.",
      recommendation:
        "Maintain current performance through advanced statistical practice.",
    },

    {
      skill: "Statistical Computing",
      current_score: 64,
      target_score: 65,
      gap: 1,
      priority: "Low",
      status: "Strong",
      reason:
        "Statistical computing performance is almost at the required target.",
      recommendation:
        "Continue practical programming and statistical computing exercises.",
    },

    {
      skill: "Data Visualization",
      current_score: 76,
      target_score: 70,
      gap: 0,
      priority: "Low",
      status: "Target Achieved",
      reason:
        "Current visualization competency is above the target requirement.",
      recommendation:
        "Maintain the existing level and explore advanced visualization techniques.",
    },
  ],

  // =========================================================
  // RECOMMENDED COURSES
  // =========================================================
  recommended_courses: [
    {
      course_id: "PROB101",
      title: "Probability Fundamentals",
      skill: "Probability",
      category: "Probability",
      level: "Beginner",
      duration: "6 hours",
      priority: "High",
      description:
        "Build a strong foundation in probability concepts, events, conditional probability and basic probability models.",
      reason:
        "Recommended because Probability has the highest skill gap.",
    },

    {
      course_id: "PROB201",
      title: "Probability Distributions",
      skill: "Probability",
      category: "Probability",
      level: "Intermediate",
      duration: "8 hours",
      priority: "High",
      description:
        "Learn discrete and continuous probability distributions and their applications in statistical analysis.",
      reason:
        "Recommended to strengthen the employee's probability competency.",
    },

    {
      course_id: "DA101",
      title: "Data Analysis Fundamentals",
      skill: "Data Analysis",
      category: "Data Analysis",
      level: "Beginner",
      duration: "7 hours",
      priority: "Medium",
      description:
        "Learn data preparation, exploratory analysis, descriptive statistics and practical analytical workflows.",
      reason:
        "Recommended because Data Analysis is the second-largest skill gap.",
    },

    {
      course_id: "DA201",
      title: "Advanced Data Analysis",
      skill: "Data Analysis",
      category: "Data Analysis",
      level: "Intermediate",
      duration: "9 hours",
      priority: "Medium",
      description:
        "Develop advanced analytical skills using practical datasets and statistical techniques.",
      reason:
        "Helps move Data Analysis competency toward the target score.",
    },

    {
      course_id: "STAT201",
      title: "Applied Statistical Methods",
      skill: "Statistics",
      category: "Statistics",
      level: "Intermediate",
      duration: "8 hours",
      priority: "Low",
      description:
        "Apply statistical methods to real-world analytical and decision-making problems.",
      reason:
        "Provides advanced practice while maintaining strong statistical competency.",
    },
  ],

  // =========================================================
  // AI LEARNING PATH
  // =========================================================
  learning_path: [
    {
      step: 1,
      course_id: "PROB101",
      title: "Probability Fundamentals",
      skill: "Probability",
      reason: "Close the largest identified skill gap first.",
      status: "Recommended",
    },

    {
      step: 2,
      course_id: "PROB201",
      title: "Probability Distributions",
      skill: "Probability",
      reason: "Build intermediate probability competency.",
      status: "Recommended",
    },

    {
      step: 3,
      course_id: "DA101",
      title: "Data Analysis Fundamentals",
      skill: "Data Analysis",
      reason: "Address the next significant competency gap.",
      status: "Recommended",
    },

    {
      step: 4,
      course_id: "DA201",
      title: "Advanced Data Analysis",
      skill: "Data Analysis",
      reason: "Move Data Analysis competency closer to the target.",
      status: "Recommended",
    },
  ],

  // =========================================================
  // LEARNING PROGRESS
  // =========================================================
  learning_progress: {
    courses_started: 2,
    courses_completed: 1,
    learning_hours: 8,
    weekly_goal: 10,
    weekly_progress: 8,
  },

  // =========================================================
  // ASSESSMENT INFORMATION
  // =========================================================
  assessment: {
    latest_score: 72,
    quiz_accuracy: 74,
    assessment_attempts: 3,
    last_assessment: "Competency Assessment",
  },

  // =========================================================
  // AI INSIGHTS
  // =========================================================
  ai_insights: [
    {
      type: "priority",
      title: "Priority Skill",
      message:
        "Probability requires the most improvement with a 42-point gap from the target.",
    },

    {
      type: "recommendation",
      title: "Recommended Learning",
      message:
        "Start with Probability Fundamentals before progressing to Probability Distributions.",
    },

    {
      type: "strength",
      title: "Strong Skill",
      message:
        "Statistics and Data Visualization are currently performing near or above their target levels.",
    },

    {
      type: "progress",
      title: "Learning Progress",
      message:
        "Consistent learning activity can help improve competency across identified skill gaps.",
    },
  ],
};

export default statwiseAnalysis;