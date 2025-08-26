
export const MOCK_QUESTION_BANK = {
  "meta": {
    "version": "1.0",
    "created_by": "PSR++ generator",
    "note": "Core psychometric + domain templates. Use Gemini/OpenAI to expand followups."
  },
  "constructs": [
    "OPP","EXEC","RES","LEARN","AMBIG","RISK","FMF","LEAD","ETHICS","FOCUS",
    "CTX_EDU","CTX_SOCIO","COGNITIVE","MOTIVATION","EQ"
  ],
  "domains": [
    "all","AgriTech","Health","SaaS","FinTech","Consumer","Energy","EdTech","Manufacturing"
  ],
  "questions": [
    { "id":"Q_BASE_01","text":"I regularly talk to potential users before building a feature. (1=Strongly disagree … 5=Strongly agree)","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_02","text":"I break larger goals into weekly measurable tasks and track them.","type":"likert","scale":[1,5],"construct":"EXEC","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_03","text":"When a major setback happens, I usually take action within a week.","type":"likert","scale":[1,5],"construct":"RES","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_04","text":"I actively seek feedback that contradicts my assumptions.","type":"likert","scale":[1,5],"construct":"LEARN","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_05","text":"I can make decisions even when I don’t have all the information.","type":"likert","scale":[1,5],"construct":"AMBIG","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_06","text":"I prefer making calculated bets and have a plan to limit downside.","type":"likert","scale":[1,5],"construct":"RISK","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_07","text":"I have direct experience or deep domain knowledge relevant to my idea.","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.5,"reverse":false},
    { "id":"Q_BASE_08","text":"I can attract strong people to work with me for a cause.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_09","text":"I prefer transparent and principled decision-making even when inconvenient.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_BASE_10","text":"I can say no to good ideas to protect the priority of the main idea.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_PERS_01","text":"What type of school did you attend during ages 6–16?","type":"categorical","options":["Government/State","Private (local)","Private (national board)","Boarding/International"],"construct":"CTX_EDU","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_PERS_02","text":"Which town/district did you mostly grow up in?","type":"categorical","options":["Metro","Tier-2 City","Small Town","Rural Village"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_PERS_03","text":"During childhood, family occupation was mainly:","type":"categorical","options":["Agriculture","Family Business/Trade","Salaried Professionals","Others"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_PERS_04","text":"Did you participate in leadership/competitions/extracurriculars in school? (1=Never … 5=Very often)","type":"likert","scale":[1,5],"construct":"CTX_EDU","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_PERS_05","text":"Which of these best describes your earliest job/work before entrepreneurship?","type":"categorical","options":["Corporate","Startup","Self-employed","Agriculture/Field work","Student/no work"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_MENT_01","text":"When under stress, which describes you best?","type":"categorical","options":["Work more alone","Seek team support","Step away temporarily","Rely on personal routines"],"construct":"EQ","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_MENT_02","text":"How frequently in the past month did you feel overwhelmed?","type":"categorical","options":["Never","Rarely","Sometimes","Often"],"construct":"EQ","domain_tags":["all"],"weight":1.0,"reverse":true},

    { "id":"Q_HOB_01","text":"Do you have a hobby you have pursued for more than 2 years?","type":"categorical","options":["Yes","No"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_HOB_02","text":"Have you ever monetized a hobby or run a small side-business?","type":"categorical","options":["Yes","No"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.2,"reverse":false},

    { "id":"Q_EVI_01","text":"How many customer/user interviews have you done for this idea?","type":"numeric","scale":[0,1000],"construct":"FMF","domain_tags":["all"],"weight":2.0,"reverse":false,"branch_on":{"condition":"<","value":5,"enqueue":["Q_AGRI_07","Q_BASE_11"]}},
    { "id":"Q_BASE_11","text":"If you have fewer than 5 interviews, list the top 3 channels you would use to recruit users for interviews.","type":"free_text","construct":"OPP","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_EVIDENCE_02","text":"Provide up to 3 evidence links/files (pilot report, deck, pilot photos). You will be asked to upload.","type":"free_text","construct":"FMF","domain_tags":["all"],"weight":0.0,"reverse":false},

    { "id":"Q_COG_01","text":"You have 3 resources and 6 tasks. Which approach do you pick?","type":"categorical","options":["Prioritize tasks & find resource swaps","Pause & hire","Drop tasks"],"construct":"COGNITIVE","domain_tags":["all"],"weight":1.0,"reverse":false},
    { "id":"Q_COG_02","text":"Solve this mini problem: If A implies B and B implies C, which implies C?","type":"categorical","options":["A","B","C","None"],"construct":"COGNITIVE","domain_tags":["all"],"weight":1.5,"reverse":false},

    { "id":"Q_MOT_01","text":"What motivates you most to start this venture?","type":"categorical","options":["Impact","Income","Independence","Recognition","Curiosity"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_VERB_01","text":"(Consistency check) Describe briefly what you would do if your product failed to reach 100 users in 6 months.","type":"free_text","construct":"EXEC","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_12","text":"I document lessons and do postmortems after experiments.","type":"likert","scale":[1,5],"construct":"LEARN","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_13","text":"I maintain a clear North-Star metric for the product.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_14","text":"I set aside dedicated deep-work time each day (2 hours +) to work on critical tasks.","type":"likert","scale":[1,5],"construct":"EXEC","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_15","text":"I can explain my idea in one sentence clearly to a non-technical person.","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_16","text":"I run pre-mortems to anticipate how my idea can fail before I invest heavily.","type":"likert","scale":[1,5],"construct":"RISK","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_17","text":"I have at least one credible mentor or domain expert I can reach within 1 week.","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.2,"reverse":false},

    { "id":"Q_BASE_18","text":"If offered a partnership that compromises your values but boosts revenue, I would decline.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_19","text":"How do you prefer to collect feedback?","type":"categorical","options":["Calls","Surveys","Analytics","In-person"],"construct":"OPP","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_BASE_20","text":"Rate your ability to attract early customers (1 low - 5 high).","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.5,"reverse":false},

    { "id":"Q_BASE_21","text":"If your financial runway is 3 months, what would be your first action?","type":"free_text","construct":"RISK","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_LEAD_01","text":"I coach people around me and help them grow.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_LEAD_02","text":"When hiring, I use clear hiring scorecards and references.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_ETH_01","text":"I disclose major risks to my early customers transparently.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_FOCUS_02","text":"When many ideas appear promising, I can prioritize and kill initiatives that don't align with the North Star.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_TEAM_01","text":"Have you previously worked in cross-functional teams? (numeric years)","type":"numeric","scale":[0,50],"construct":"LEAD","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_INVEST_01","text":"Have you raised capital before?","type":"categorical","options":["No","Friends & Family","Angel","Seed/VC"],"construct":"FMF","domain_tags":["all"],"weight":1.5,"reverse":false},

    { "id":"Q_PSY_01","text":"(Ryff proxy) I feel that I am growing and changing in positive ways. (1..5)","type":"likert","scale":[1,5],"construct":"EQ","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_OPP_02","text":"I track competitors and analogous markets for inspiration and threats.","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0,"reverse":false},

    { "id":"Q_AGRI_01","text":"Have you worked on a farm or in agri-supply chains? (numeric years)","type":"numeric","scale":[0,50],"construct":"FMF","domain_tags":["AgriTech"],"weight":2.0,"reverse":false},
    { "id":"Q_AGRI_02","text":"Which crops or farmer problems are you targeting?","type":"free_text","construct":"FMF","domain_tags":["AgriTech"],"weight":1.0,"reverse":false},
    { "id":"Q_AGRI_03","text":"Do farmers in your pilot area have access to smartphones? (1..5)","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["AgriTech"],"weight":1.0,"reverse":false},
    { "id":"Q_AGRI_04","text":"Does your product require seasonal fit/harvest alignment?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["AgriTech"],"weight":1.0,"reverse":false},
    { "id":"Q_AGRI_05","text":"If yes, which season(s) and how will you plan payback cycles?","type":"free_text","construct":"RISK","domain_tags":["AgriTech"],"weight":1.0,"reverse":false},
    { "id":"Q_AGRI_06","text":"Do you have local extension or university partnerships?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["AgriTech"],"weight":1.5,"reverse":false},
    { "id":"Q_AGRI_07","text":"List the top three channels to reach 100 farmers in your pilot region.","type":"free_text","construct":"OPP","domain_tags":["AgriTech"],"weight":1.0,"reverse":false},

    { "id":"Q_HEALTH_01","text":"Does your product involve patient data or clinical outcomes?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Health"],"weight":2.0,"reverse":false, "branch_on":{"condition":"==","value":"Yes","enqueue":["Q_HEALTH_02","Q_HEALTH_03"]}},
    { "id":"Q_HEALTH_02","text":"Do you have clinical collaborators or an institutional tie-up?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["Health"],"weight":1.5,"reverse":false},
    { "id":"Q_HEALTH_03","text":"Is regulatory approval likely (timeline in months)?","type":"numeric","scale":[0,60],"construct":"RISK","domain_tags":["Health"],"weight":1.5,"reverse":false},

    { "id":"Q_SAAS_01","text":"Is there an existing MVP or prototype you can demo?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["SaaS"],"weight":2.0,"reverse":false,"branch_on":{"condition":"==","value":"Yes","enqueue":["Q_SAAS_02"]}},
    { "id":"Q_SAAS_02","text":"Current MAU (monthly active users) or test users?","type":"numeric","scale":[0,1000000],"construct":"FMF","domain_tags":["SaaS"],"weight":2.0,"reverse":false},
    { "id":"Q_SAAS_03","text":"Typical sales cycle length for your target customer (months)?","type":"numeric","scale":[0,24],"construct":"OPP","domain_tags":["SaaS"],"weight":1.0,"reverse":false},

    { "id":"Q_FIN_01","text":"Does your idea handle payments or financial advice?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["FinTech"],"weight":2.0,"reverse":false,"branch_on":{"condition":"==","value":"Yes","enqueue":["Q_FIN_02","Q_FIN_03"]}},
    { "id":"Q_FIN_02","text":"Are you familiar with KYC/AML requirements in your target market? (1..5)","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["FinTech"],"weight":1.5,"reverse":false},
    { "id":"Q_FIN_03","text":"Do you have payment rails/integration plan?","type":"free_text","construct":"OPP","domain_tags":["FinTech"],"weight":1.0,"reverse":false},

    { "id":"Q_CONS_01","text":"Have you conducted consumer pricing experiments?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["Consumer"],"weight":1.5,"reverse":false},
    { "id":"Q_CONS_02","text":"What is the primary customer acquisition channel you expect to use?","type":"free_text","construct":"OPP","domain_tags":["Consumer"],"weight":1.0,"reverse":false},

    { "id":"Q_ENERGY_01","text":"Does your product require lengthy certification or long installation cycles?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Energy"],"weight":1.5,"reverse":false},

    { "id":"Q_EDU_01","text":"Does your solution require school or institutional buy-in?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["EdTech"],"weight":1.2,"reverse":false},
    { "id":"Q_MAN_01","text":"Does the product require prototyping or specialized manufacturing?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Manufacturing"],"weight":1.5,"reverse":false},

    { "id":"Q_FINAL_01","text":"(Self-check) On a scale 1–5, how confident are you that you will continue working on this idea in 12 months?","type":"likert","scale":[1,5],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.5,"reverse":false},

    { "id":"Q_SAFE_01","text":"(Optional) If you'd like, share a CV or portfolio link for verification (will be stored encrypted).","type":"free_text","construct":"FMF","domain_tags":["all"],"weight":0.0,"reverse":false}
  ]
};

    