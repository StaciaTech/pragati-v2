
export const NEW_QUESTION_BANK = {
  "domains": [
    {
      "id": "entrepreneurial_potential",
      "name": "Entrepreneurial Potential",
      "questions": [
        {
          "id": "ep1",
          "text": "When faced with limited resources, how do you usually respond?",
          "type": "multiple_choice",
          "options": [
            { "label": "Find creative alternatives", "score": 5 },
            { "label": "Wait until resources are available", "score": 2 },
            { "label": "Drop the idea", "score": 0 }
          ],
          "weight": 1.2
        },
        {
          "id": "ep2",
          "text": "How comfortable are you with taking calculated risks?",
          "type": "scale",
          "scale_min": 1,
          "scale_max": 5,
          "weight": 1.5
        },
        {
          "id": "ep3",
          "text": "Describe your past experience with initiating a project or idea.",
          "type": "open_text",
          "analysis": "NLP sentiment + keyword extraction",
          "weight": 1.0
        }
      ],
      "scoring_formula": "(Σ(score * weight) / max_possible_score) * 100"
    },
    {
      "id": "psychological_resilience",
      "name": "Psychological Resilience",
      "questions": [
        {
          "id": "pr1",
          "text": "When a project you worked hard on fails, what is your first reaction?",
          "type": "multiple_choice",
          "options": [
            { "label": "Look for learning opportunities", "score": 5 },
            { "label": "Feel discouraged but try again", "score": 3 },
            { "label": "Give up quickly", "score": 0 }
          ],
          "weight": 1.3
        },
        {
          "id": "pr2",
          "text": "On average, how often do you feel anxious about your work or studies?",
          "type": "scale",
          "scale_min": 1,
          "scale_max": 5,
          "reverse_scoring": true,
          "weight": 1.4
        },
        {
          "id": "pr3",
          "text": "What personal strategies do you use to handle stress?",
          "type": "open_text",
          "analysis": "NLP resilience keyword mapping",
          "weight": 1.1
        }
      ],
      "scoring_formula": "(Σ(score * weight) / max_possible_score) * 100"
    }
  ],
  "final_score_formula": "0.6 * entrepreneurial_potential + 0.4 * psychological_resilience"
};
