
export const MOCK_QUESTION_BANK = {
  "meta": {
    "version": "1.0",
    "created_by": "PSR++ generator",
    "note": "Core psychometric + domain templates. Use Gemini/OpenAI to expand followups."
  },
  "constructs": [
    "OPP","EXEC","RES","LEARN","AMBIG","RISK","FMF","LEAD","ETHICS","FOCUS",
    "CTX_EDU","CTX_SOCIO","COGNITIVE","MOTIVATION","EQ", "NETWORK", "FINANCE"
  ],
  "domains": [
    "all","AgriTech","Health","SaaS","FinTech","Consumer","Energy","EdTech","Manufacturing", "Logistics", "ClimateTech"
  ],
  "questions": [
    {"id":"Q001","text":"I regularly talk to potential users before building features.","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0},
    {"id":"Q002","text":"I break large goals into weekly measurable tasks and track them.","type":"likert","scale":[1,5],"construct":"EXEC","domain_tags":["all"],"weight":1.0},
    {"id":"Q003","text":"When a major setback happens, I usually take action within a week.","type":"likert","scale":[1,5],"construct":"RES","domain_tags":["all"],"weight":1.0},
    {"id":"Q004","text":"I actively seek feedback that contradicts my assumptions.","type":"likert","scale":[1,5],"construct":"LEARN","domain_tags":["all"],"weight":1.0},
    {"id":"Q005","text":"I can make decisions even when I lack full information.","type":"likert","scale":[1,5],"construct":"AMBIG","domain_tags":["all"],"weight":1.0},
    {"id":"Q006","text":"I prefer making calculated bets and have plans to limit downside.","type":"likert","scale":[1,5],"construct":"RISK","domain_tags":["all"],"weight":1.0},
    {"id":"Q007","text":"I have direct experience or deep domain knowledge relevant to my idea.","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q008","text":"I can attract strong people to work with me for a cause.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q009","text":"I prefer transparent and principled decision-making even when inconvenient.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0},
    {"id":"Q010","text":"I can say no to good ideas to protect the priority of the main idea.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0},

    {"id":"Q011","text":"What type of school did you attend between ages 6–16?","type":"categorical","options":["Government/State","Private (local)","Private (national)","Boarding/International"],"construct":"CTX_EDU","domain_tags":["all"],"weight":1.0},
    {"id":"Q012","text":"Which region did you mostly grow up in?","type":"categorical","options":["Metro","Tier-2 City","Small Town","Rural Village"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0},
    {"id":"Q013","text":"During childhood, family occupation was mainly:","type":"categorical","options":["Agriculture","Family Business","Salaried","Other"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0},
    {"id":"Q014","text":"Did you participate in leadership or competitions at school?","type":"likert","scale":[1,5],"construct":"CTX_EDU","domain_tags":["all"],"weight":1.0},
    {"id":"Q015","text":"Which best describes your first job/work before entrepreneurship?","type":"categorical","options":["Corporate","Startup","Self-employed","Agriculture","Student"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":1.0},

    {"id":"Q016","text":"When under stress, which describes you best?","type":"categorical","options":["Work more alone","Seek team support","Step away","Rely on routines"],"construct":"EQ","domain_tags":["all"],"weight":1.0},
    {"id":"Q017","text":"How often in the past month did you feel overwhelmed?","type":"categorical","options":["Never","Rarely","Sometimes","Often"],"construct":"EQ","domain_tags":["all"],"weight":1.0},

    {"id":"Q018","text":"Do you have a hobby you have pursued for more than 2 years?","type":"categorical","options":["Yes","No"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.0},
    {"id":"Q019","text":"Have you ever monetized a hobby or run a small side-business?","type":"categorical","options":["Yes","No"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.2},

    {"id":"Q020","text":"How many customer/user interviews have you done for this idea?","type":"numeric","scale":[0,1000],"construct":"FMF","domain_tags":["all"],"weight":2.0,"branch_on":{"condition":"<","value":5,"enqueue":["Q051"]}},
    {"id":"Q021","text":"If fewer than 5 interviews, list the top 3 channels you'd use to recruit users.","type":"free_text","construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q022","text":"Provide up to 3 evidence links/files (pilot report, deck, pilot photos).","type":"free_text","construct":"FMF","domain_tags":["all"],"weight":0.0},

    {"id":"Q023","text":"You have 3 resources and 6 tasks. What approach? (A: Prioritize tasks & resource swaps / B: Pause & hire / C: Drop tasks)","type":"categorical","options":["A","B","C"],"construct":"COGNITIVE","domain_tags":["all"],"weight":1.0},
    {"id":"Q024","text":"Mini logic question: If A->B and B->C, then A->C?","type":"categorical","options":["Yes","No","Can't tell"],"construct":"COGNITIVE","domain_tags":["all"],"weight":1.5},

    {"id":"Q025","text":"What motivates you most?","type":"categorical","options":["Impact","Income","Independence","Recognition","Curiosity"],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.0},
    {"id":"Q026","text":"Describe briefly what you'd do if product failed to reach 100 users in 6 months.","type":"free_text","construct":"EXEC","domain_tags":["all"],"weight":1.0},

    {"id":"Q027","text":"I document lessons and do postmortems after experiments.","type":"likert","scale":[1,5],"construct":"LEARN","domain_tags":["all"],"weight":1.0},
    {"id":"Q028","text":"I maintain a clear North-Star metric for the product.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0},
    {"id":"Q029","text":"I set aside 2+ hour deep-work time each day.","type":"likert","scale":[1,5],"construct":"EXEC","domain_tags":["all"],"weight":1.0},
    {"id":"Q030","text":"I can explain my idea in 1 sentence to a non-technical person.","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q031","text":"I run pre-mortems to anticipate how my idea can fail.","type":"likert","scale":[1,5],"construct":"RISK","domain_tags":["all"],"weight":1.0},
    {"id":"Q032","text":"I have at least one credible mentor or domain expert I can reach within 1 week.","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.2},

    {"id":"Q033","text":"If offered a partnership that compromises your values but boosts revenue, I would decline.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0},
    {"id":"Q034","text":"How do you prefer to collect feedback?","type":"categorical","options":["Calls","Surveys","Analytics","In-person"],"construct":"OPP","domain_tags":["all"],"weight":1.0},
    {"id":"Q035","text":"Rate your ability to attract early customers (1 low - 5 high).","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["all"],"weight":1.5},

    {"id":"Q036","text":"If your runway is 3 months, what is your first action?","type":"free_text","construct":"RISK","domain_tags":["all"],"weight":1.0},
    {"id":"Q037","text":"I coach people and help them grow.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q038","text":"When hiring, I use hiring scorecards and references.","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0},

    {"id":"Q039","text":"I disclose major risks to early customers transparently.","type":"likert","scale":[1,5],"construct":"ETHICS","domain_tags":["all"],"weight":1.0},
    {"id":"Q040","text":"When many ideas appear promising, I can prioritize and kill non-core initiatives.","type":"likert","scale":[1,5],"construct":"FOCUS","domain_tags":["all"],"weight":1.0},

    {"id":"Q041","text":"Have you previously worked in cross-functional teams? (years)","type":"numeric","scale":[0,50],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q042","text":"Have you raised capital before?","type":"categorical","options":["No","F&F","Angel","Seed/VC"],"construct":"FMF","domain_tags":["all"],"weight":1.5},

    {"id":"Q043","text":"I feel that I am growing and changing in positive ways.","type":"likert","scale":[1,5],"construct":"EQ","domain_tags":["all"],"weight":1.0},
    {"id":"Q044","text":"I track competitors and analog markets for inspiration.","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q045","text":"AgriTech: Have you worked on a farm or in agri-supply chains? (years)","type":"numeric","scale":[0,50],"construct":"FMF","domain_tags":["AgriTech"],"weight":2.0},
    {"id":"Q046","text":"AgriTech: Which crops or farmer problems are you targeting?","type":"free_text","construct":"FMF","domain_tags":["AgriTech"],"weight":1.0},
    {"id":"Q047","text":"AgriTech: Do farmers in your pilot area have smartphones?","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["AgriTech"],"weight":1.0},
    {"id":"Q048","text":"AgriTech: Does your product require seasonal fit/harvest alignment?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["AgriTech"],"weight":1.0},
    {"id":"Q049","text":"AgriTech: If yes, which seasons and payback cycles?","type":"free_text","construct":"RISK","domain_tags":["AgriTech"],"weight":1.0},
    {"id":"Q050","text":"AgriTech: Do you have extension/university partnerships?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["AgriTech"],"weight":1.5},
    {"id":"Q051","text":"AgriTech followup: List top 3 channels to reach 100 farmers.","type":"free_text","construct":"OPP","domain_tags":["AgriTech"],"weight":1.0},

    {"id":"Q052","text":"Health: Does your product involve patient data or outcomes?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Health"],"weight":2.0,"branch_on":{"condition":"==","value":"Yes","enqueue":["Q053","Q054"]}},
    {"id":"Q053","text":"Health followup: Do you have clinical collaborators or institutional tie-ups?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["Health"],"weight":1.5},
    {"id":"Q054","text":"Health followup: Is regulatory approval likely (timeline months)?","type":"numeric","scale":[0,60],"construct":"RISK","domain_tags":["Health"],"weight":1.5},

    {"id":"Q055","text":"SaaS: Is there an MVP/prototype to demo?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["SaaS"],"weight":2.0,"branch_on":{"condition":"==","value":"Yes","enqueue":["Q056"]}},
    {"id":"Q056","text":"SaaS followup: Current MAU or test users?","type":"numeric","scale":[0,1000000],"construct":"FMF","domain_tags":["SaaS"],"weight":2.0},
    {"id":"Q057","text":"SaaS: Typical sales cycle length (months)?","type":"numeric","scale":[0,24],"construct":"OPP","domain_tags":["SaaS"],"weight":1.0},

    {"id":"Q058","text":"FinTech: Does your idea handle payments or advice?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["FinTech"],"weight":2.0,"branch_on":{"condition":"==","value":"Yes","enqueue":["Q059","Q060"]}},
    {"id":"Q059","text":"FinTech followup: Familiarity with KYC/AML? (1..5)","type":"likert","scale":[1,5],"construct":"FMF","domain_tags":["FinTech"],"weight":1.5},
    {"id":"Q060","text":"FinTech followup: Payment rails/integration plan?","type":"free_text","construct":"OPP","domain_tags":["FinTech"],"weight":1.0},

    {"id":"Q061","text":"Consumer: Have you conducted consumer pricing experiments?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["Consumer"],"weight":1.5},
    {"id":"Q062","text":"Consumer: Primary customer acquisition channel?","type":"free_text","construct":"OPP","domain_tags":["Consumer"],"weight":1.0},

    {"id":"Q063","text":"Energy: Does product require lengthy certification or long install cycles?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Energy"],"weight":1.5},

    {"id":"Q064","text":"EdTech: Does the solution require school/institution buy-in?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["EdTech"],"weight":1.2},
    {"id":"Q065","text":"Manufacturing: Does product require specialized prototyping/manufacturing?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Manufacturing"],"weight":1.5},

    {"id":"Q066","text":"Logistics: Does your solution depend on ground fleet or 3PL?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Logistics"],"weight":1.5},
    {"id":"Q067","text":"ClimateTech: Is long-term capital intensive CAPEX required?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["ClimateTech"],"weight":1.5},

    {"id":"Q068","text":"Final confidence: How confident are you you'll work on this idea in 12 months? (1..5)","type":"likert","scale":[1,5],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.5},
    {"id":"Q069","text":"Optional: Share CV or portfolio link for verification.","type":"free_text","construct":"FMF","domain_tags":["all"],"weight":0.0},

    {"id":"Q070","text":"(Consistency) How do you handle multiple urgent deadlines?","type":"free_text","construct":"EXEC","domain_tags":["all"],"weight":1.0},

    {"id":"Q071","text":"Have you been part of a startup founding team before?","type":"categorical","options":["No","Yes - early stage","Yes - scaling"],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q072","text":"Do you have prior patents or published technical work?","type":"categorical","options":["No","Yes - patents","Yes - publications","Both"],"construct":"FMF","domain_tags":["all"],"weight":1.5},

    {"id":"Q073","text":"Rate your networking frequency with domain experts (monthly/quarterly/yearly/never)","type":"categorical","options":["Monthly","Quarterly","Yearly","Never"],"construct":"NETWORK","domain_tags":["all"],"weight":1.0},
    {"id":"Q074","text":"Do you maintain a written Insight Log for customer learnings?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q075","text":"How many prototypes/MVPs have you built previously?","type":"numeric","scale":[0,50],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q076","text":"How often do you revise milestones based on new data? (Never/Rarely/Sometimes/Often)","type":"categorical","options":["Never","Rarely","Sometimes","Often"],"construct":"LEARN","domain_tags":["all"],"weight":1.0},

    {"id":"Q077","text":"Are you comfortable delegating critical tasks?","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q078","text":"Do you keep a personal budget and cash cushion (months)?","type":"numeric","scale":[0,36],"construct":"FINANCE","domain_tags":["all"],"weight":1.0},

    {"id":"Q079","text":"Have you previously hired contractors or employees?","type":"categorical","options":["No","Yes - contractors","Yes - full time"],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q080","text":"How quickly do you incorporate user feedback into product changes? (days)","type":"numeric","scale":[0,365],"construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q081","text":"How many paying customers have you had on any prior project?","type":"numeric","scale":[0,10000],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q082","text":"Do you track unit economics for your models?","type":"categorical","options":["Yes","No"],"construct":"FINANCE","domain_tags":["all"],"weight":1.2},

    {"id":"Q083","text":"Mental health proxy: In the past 3 months, have you felt persistently low energy?","type":"categorical","options":["No","Yes - sometimes","Yes - often"],"construct":"EQ","domain_tags":["all"],"weight":1.0},
    {"id":"Q084","text":"Do you have a support network to talk through tough decisions?","type":"categorical","options":["Yes","No"],"construct":"EQ","domain_tags":["all"],"weight":1.0},

    {"id":"Q085","text":"Are you fluent in English? (Y/N)","type":"categorical","options":["Yes","No"],"construct":"CTX_EDU","domain_tags":["all"],"weight":0.5},
    {"id":"Q086","text":"Do you speak local/regional languages relevant to your target market?","type":"categorical","options":["Yes","No"],"construct":"CTX_SOCIO","domain_tags":["all"],"weight":0.5},

    {"id":"Q087","text":"Have you or your team participated in accelerator programs?","type":"categorical","options":["No","Yes - local","Yes - international"],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q088","text":"Do you keep minutes or a short journal after pivots/experiments?","type":"categorical","options":["Yes","No"],"construct":"LEARN","domain_tags":["all"],"weight":1.0},

    {"id":"Q089","text":"Have you hired or worked with domain experts to validate assumptions?","type":"categorical","options":["No","Occasionally","Frequently"],"construct":"FMF","domain_tags":["all"],"weight":1.5},
    {"id":"Q090","text":"How do you value failures: learning vs loss? (scale 1..5)","type":"likert","scale":[1,5],"construct":"RES","domain_tags":["all"],"weight":1.0},

    {"id":"Q091","text":"Do you have an industry mentor who provides 1:1 feedback?","type":"categorical","options":["No","Yes - occasional","Yes - regular"],"construct":"FMF","domain_tags":["all"],"weight":1.2},
    {"id":"Q092","text":"Do you maintain a network of peers for mutual help?","type":"categorical","options":["No","Yes - limited","Yes - broad"],"construct":"NETWORK","domain_tags":["all"],"weight":1.0},

    {"id":"Q093","text":"How many hours per week can you commit to building this startup? (numeric)","type":"numeric","scale":[0,168],"construct":"MOTIVATION","domain_tags":["all"],"weight":1.5},
    {"id":"Q094","text":"Have you previously sold a product or service?","type":"categorical","options":["No","Yes - small scale","Yes - commercial"],"construct":"FMF","domain_tags":["all"],"weight":1.5},

    {"id":"Q095","text":"Do you conduct customer discovery before building?","type":"likert","scale":[1,5],"construct":"OPP","domain_tags":["all"],"weight":1.0},
    {"id":"Q096","text":"Do you pilot pricing experiments?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["all"],"weight":1.0},

    {"id":"Q097","text":"Are you comfortable with ambiguity in day-to-day operations?","type":"likert","scale":[1,5],"construct":"AMBIG","domain_tags":["all"],"weight":1.0},
    {"id":"Q098","text":"Do you prefer planning or improvisation when resources are limited?","type":"categorical","options":["Planning","Improvisation","Blend"],"construct":"EXEC","domain_tags":["all"],"weight":1.0},

    {"id":"Q099","text":"Would you consider a cofounder with complementary skills?","type":"likert","scale":[1,5],"construct":"LEAD","domain_tags":["all"],"weight":1.0},
    {"id":"Q100","text":"What is your preferred decision-making horizon? (days/weeks/months/years)","type":"categorical","options":["Days","Weeks","Months","Years"],"construct":"FOCUS","domain_tags":["all"],"weight":1.0},

    {"id":"Q101","text":"SaaS deep: What is your churn rate in current pilots? (numeric)","type":"numeric","scale":[0,100],"construct":"FMF","domain_tags":["SaaS"],"weight":1.5},
    {"id":"Q102","text":"SaaS deep: Do you have integrations or API plans?","type":"categorical","options":["Yes","No"],"construct":"OPP","domain_tags":["SaaS"],"weight":1.0},

    {"id":"Q103","text":"FinTech deep: Which regulatory body applies to your product? (free_text)","type":"free_text","construct":"RISK","domain_tags":["FinTech"],"weight":1.5},
    {"id":"Q104","text":"FinTech deep: Are you planning to partner with banks/payment processors?","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["FinTech"],"weight":1.2},

    {"id":"Q105","text":"Health deep: Have you obtained IRB or ethical clearance in the past?","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Health"],"weight":1.5},
    {"id":"Q106","text":"Health deep: Do you plan clinical pilots? (Y/N)","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["Health"],"weight":1.5},

    {"id":"Q107","text":"Agri deep: Which local NGOs or cooperatives can help distribution? (free_text)","type":"free_text","construct":"OPP","domain_tags":["AgriTech"],"weight":1.0},
    {"id":"Q108","text":"Energy deep: Does installation require certified engineers? (Y/N)","type":"categorical","options":["Yes","No"],"construct":"RISK","domain_tags":["Energy"],"weight":1.5},

    {"id":"Q109","text":"Manufacturing deep: Do you have supply chain partners? (Y/N)","type":"categorical","options":["Yes","No"],"construct":"FMF","domain_tags":["Manufacturing"],"weight":1.5},
    {"id":"Q110","text":"ClimateTech deep: What is the expected payback period (months)?","type":"numeric","scale":[0,120],"construct":"RISK","domain_tags":["ClimateTech"],"weight":1.5}
  ]
}
