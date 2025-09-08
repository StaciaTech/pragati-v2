
export const MOCK_QUESTION_BANK = {
  name: "Pragati Psychometric Assessment",
  description: "An assessment to understand the innovator's mindset, strengths, and potential.",
  domains: [
    {
      name: "Entrepreneurial Profile",
      questions: [
        {
          id: "ep_start",
          text: "When faced with a major setback, what is your immediate reaction?",
          type: "multiple_choice",
          options: [
            { label: "Analyze what went wrong to learn from it.", score: 8, next_question: "ep_risk_appetite" },
            { label: "Immediately start looking for a new solution or pivot.", score: 10, next_question: "ep_risk_appetite" },
            { label: "Feel discouraged and need time to recover.", score: 3, next_question: "ep_risk_appetite" },
            { label: "Seek advice from mentors or team members.", score: 6, next_question: "ep_risk_appetite" },
          ],
        },
        {
          id: "ep_risk_appetite",
          text: "Which statement best describes your appetite for risk?",
          type: "multiple_choice",
          options: [
            { label: "I prefer calculated risks with a clear potential upside.", score: 8, next_question: "ep_ambiguity" },
            { label: "I thrive on high-risk, high-reward situations.", score: 10, next_question: "ep_ambiguity" },
            { label: "I am generally risk-averse and prefer stable paths.", score: 3, next_question: "ep_ambiguity" },
            { label: "I'm willing to take risks if I have a strong team to support me.", score: 6, next_question: "ep_ambiguity" },
          ],
        },
        {
            id: "ep_ambiguity",
            text: "How comfortable are you with making decisions with incomplete information?",
            type: "scale",
            scale_min: 1,
            scale_max: 5,
            min_label: "Very Uncomfortable",
            max_label: "Very Comfortable",
            next_question_logic: [
                { condition: "score >= 4", next_question_id: "ip_start" },
                { condition: "score < 4", next_question_id: "ip_start" },
            ]
        }
      ],
    },
    {
        name: "Innovation Profile",
        questions: [
            {
                id: "ip_start",
                text: "Where do your best ideas usually come from?",
                type: "multiple_choice",
                options: [
                    { label: "Observing everyday problems and frustrations.", score: 10, next_question: "ip_approach" },
                    { label: "Brainstorming sessions with a diverse group.", score: 8, next_question: "ip_approach" },
                    { label: "Deep research into a specific technology or field.", score: 7, next_question: "ip_approach" },
                    { label: "A sudden moment of inspiration (a 'shower thought').", score: 5, next_question: "ip_approach" },
                ]
            },
            {
                id: "ip_approach",
                text: "Your approach to innovation is more...",
                type: "multiple_choice",
                options: [
                    { label: "Iterative: I build, measure, and learn constantly.", score: 9, next_question: "wp_start" },
                    { label: "Visionary: I focus on a big, long-term picture.", score: 7, next_question: "wp_start" },
                    { label: "Analytical: I rely on data and research to find opportunities.", score: 8, next_question: "wp_start" },
                    { label: "Spontaneous: I follow my curiosity wherever it leads.", score: 5, next_question: "wp_start" },
                ]
            }
        ]
    },
    {
        name: "Work Profile",
        questions: [
            {
                id: "wp_start",
                text: "Describe your ideal work environment.",
                type: "open_text",
                next_question_id: "wp_feedback",
            },
            {
                id: "wp_feedback",
                text: "How do you prefer to receive feedback?",
                type: "multiple_choice",
                options: [
                    { label: "Direct, blunt, and to the point.", score: 9, next_question: "mp_start" },
                    { label: "Structured, with clear examples and suggestions.", score: 8, next_question: "mp_start" },
                    { label: "Gentle, focusing on positives before areas for improvement.", score: 5, next_question: "mp_start" },
                ]
            }
        ]
    },
    {
        name: "Motivation Profile",
        questions: [
            {
                id: "mp_start",
                text: "What is your primary driver for pursuing this idea?",
                type: "multiple_choice",
                options: [
                    { label: "Solving a meaningful problem that impacts many people.", score: 10, next_question: "mp_success" },
                    { label: "The intellectual challenge and the thrill of creation.", score: 8, next_question: "mp_success" },
                    { label: "Financial success and building a valuable company.", score: 6, next_question: "mp_success" },
                    { label: "Gaining recognition as a leader in my field.", score: 4, next_question: "mp_success" },
                ]
            },
            {
                id: "mp_success",
                text: "How do you define success for your project?",
                type: "open_text",
            }
        ]
    }
  ],
};
