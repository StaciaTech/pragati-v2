

export const MOCK_INNOVATOR_USER = {
  id: 'innovator-001',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  password: 'innovatorpass',
  isEmailVerified: true,
  isAccountLocked: false,
  credits: 1000,
  college: 'Pragati Institute of Technology',
  role: 'Innovator',
  hasPsychometricAnalysis: false,
};

export const MOCK_PRINCIPAL_USERS = [
    { email: 'principal.pit@pragati.com', password: 'principalpass', name: 'Principal PIT', collegeId: 'COL001' },
    { email: 'principal.gsi@pragati.com', password: 'principalpass', name: 'Principal GSI', collegeId: 'COL002' },
    { email: 'principal.tuc@pragati.com', password: 'principalpass', name: 'Principal TUC', collegeId: 'COL003' },
];

export const MOCK_MENTORS = [
    { id: 'MENTOR_001', name: 'Dr. Anjali Rao', email: 'anjali.rao@mentor.com', expertise: ['Agritech', 'AI'], password: 'mentorpass', hasPsychometricAnalysis: false },
    { id: 'MENTOR_002', name: 'Mr. Vikram Singh', email: 'vikram.singh@mentor.com', expertise: ['Smart Cities', 'IoT'], password: 'mentorpass', hasPsychometricAnalysis: false },
];

export const MOCK_TEAM_MEMBER_USERS = [
    { id: 'TEAM_MEMBER_001', name: 'Sunita Patil', email: 'sunita.p@example.com', password: 'teampass', role: 'Team Member', hasPsychometricAnalysis: false },
];

export const MOCK_INTERNAL_MENTOR_USERS = [
    { id: 'INTERNAL_MENTOR_001', name: 'Prof. Ramesh Gupta', email: 'ramesh.g@pragati.com', password: 'internalpass', role: 'Internal Mentor', hasPsychometricAnalysis: false },
];
