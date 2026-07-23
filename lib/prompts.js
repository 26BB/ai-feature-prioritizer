/**
 * Build the RICE scoring prompt for NVIDIA NIM
 * @param {Array} features - Array of {name, description, category}
 */
export function buildRicePrompt(features) {
  const featureList = features
    .map((f, i) => `${i + 1}. Name: "${f.name}"\n   Description: "${f.description}"\n   Category: ${f.category}`)
    .join('\n');

  return `You are a senior AI Product Manager. Analyze the following product features and score each using the RICE prioritization framework.

FEATURES TO ANALYZE:
${featureList}

RICE SCORING RULES:
- Reach (1-10): How many users will this impact per quarter? 1=<100 users, 10=>10,000 users
- Impact (1-10): How significantly does this move key product metrics? 1=minimal, 3=low, 6=medium, 8=high, 10=massive
- Confidence (10-100): How confident are we in the estimates? (as a percentage)
- Effort (1-10): How many person-months to build? 1=1 day, 5=1 month, 10=6+ months
- RICE Score = (Reach × Impact × Confidence) / Effort

SPRINT ASSIGNMENT:
- NOW: RICE score > 500 AND Effort <= 5
- NEXT: RICE score 200-500 OR Effort 5-7
- LATER: RICE score < 200 OR Effort > 7

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "name": "exact feature name",
    "reach": number,
    "impact": number,
    "confidence": number,
    "effort": number,
    "rice_score": number,
    "sprint": "NOW" | "NEXT" | "LATER",
    "reasoning": "2-3 sentence explanation of the scores and priority",
    "risks": ["risk1", "risk2"],
    "category": "category string"
  }
]`;
}
