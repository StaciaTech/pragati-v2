
import type { ValidationReport } from '@/ai/schemas';
import { MOCK_SAMPLE_REPORT, INITIAL_CLUSTER_WEIGHTS } from './reports';

export let MOCK_IDEAS: Array<{
  id: string;
  validationId: string;
  title: string;
  description: string;
  collegeId: string;
  collegeName: string;
  domain: string;
  subDomain?: string;
  locality?: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  status: string;
  dateSubmitted: string;
  version: string;
  report: ValidationReport | null; 
  clusterWeights?: Record<string, number>;
  clusterWeightsPreset?: string;
  feedback?: { overall: string; details: { aspect: string; score: number; comment: string }[] } | null;
  consultationStatus: string;
  consultationDate: string | null;
  consultationTime: string | null;
  ttcAssigned: string | null;
  trl?: string;
  externalMentorId?: string;
  internalMentorId?: string;
}> = [
  {
    id: 'IDEA-001',
    validationId: 'VALID-001-001',
    title: 'AI-Powered Smart Farming',
    description: 'An intelligent system using AI to optimize crop yield and detect diseases early.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'Agriculture',
    subDomain: 'Precision Farming',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Approved',
    dateSubmitted: '2024-01-15',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaName: 'AI-Powered Smart Farming', overallScore: 88, validationOutcome: 'Approved', recommendationText: "Rocket Fuel! This idea is cleared for launch. Let's make it happen!"},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    clusterWeightsPreset: 'Commercialization-Focused',
    feedback: null,
    consultationStatus: 'Scheduled',
    consultationDate: '2024-07-20',
    consultationTime: '10:00 AM',
    ttcAssigned: 'TTC_001',
    externalMentorId: 'MENTOR_001',
    internalMentorId: 'INTERNAL_MENTOR_001',
    trl: 'TRL 4',
  },
  {
    id: 'IDEA-002',
    validationId: 'VALID-002-001',
    title: 'Decentralized Education Platform',
    description: 'A blockchain-based platform for peer-to-peer learning with verified credentials.',
    collegeId: 'COL002',
    collegeName: 'Global School of Innovation',
    domain: 'EdTech',
    subDomain: 'Higher Education',
    innovatorId: 'INV002',
    innovatorName: 'John Smith',
    innovatorEmail: 'john.smith@example.com',
    status: 'Moderate',
    dateSubmitted: '2024-02-20',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-002', validationId: 'VALID-002-001', reportId: 'REPID-002-001-20240722', ideaName: 'Decentralized Education Platform', overallScore: 62 },
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Pending',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    trl: 'TRL 2',
  },
   {
    id: 'IDEA-003',
    validationId: 'VALID-003-001',
    title: 'HealthTech Wearable for Seniors',
    description: 'A wearable device that monitors vital signs for elderly individuals and alerts caregivers.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'HealthTech',
    subDomain: 'Wearables',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Rejected',
    dateSubmitted: '2024-03-10',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-003', validationId: 'VALID-003-001', reportId: 'REPID-003-001-20240723', ideaName: 'HealthTech Wearable for Seniors', overallScore: 42, validationOutcome: 'Rejected', recommendationText: "Back to the Lab! A great learning opportunity. Rethink the core concept and come back stronger."},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Not Requested',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    trl: 'TRL 1',
  },
  {
    id: 'IDEA-004',
    validationId: 'VALID-004-001',
    title: 'Smart City Traffic Management',
    description: 'An IoT and AI-based system to optimize traffic flow in real-time.',
    collegeId: 'COL003',
    collegeName: 'Tech University Chennai',
    domain: 'Smart Cities',
    innovatorId: 'INV004',
    innovatorName: 'Arjun Kumar',
    innovatorEmail: 'arjun.k@example.com',
    status: 'Approved',
    dateSubmitted: '2024-04-05',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-004', validationId: 'VALID-004-001', reportId: 'REPID-004-001-20240724', ideaName: 'Smart City Traffic Management', overallScore: 90, validationOutcome: 'Approved', recommendationText: "Rocket Fuel! This idea is cleared for launch. Let's make it happen!"},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Completed',
    consultationDate: '2024-04-25',
    consultationTime: '11:00 AM',
    ttcAssigned: 'TTC_002',
    externalMentorId: 'MENTOR_002',
    trl: 'TRL 8',
  },
   {
    id: 'IDEA-005',
    validationId: 'VALID-005-001',
    title: 'Personalized Financial Advisor Bot',
    description: 'A FinTech chatbot that provides personalized investment advice based on user goals.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'FinTech',
    subDomain: 'WealthTech',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Approved',
    dateSubmitted: '2024-05-22',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-005', validationId: 'VALID-005-001', reportId: 'REPID-005-001-20240725', ideaName: 'Financial Advisor Bot', overallScore: 80, validationOutcome: 'Moderate'},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Pending',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: 'TTC_001',
    trl: 'TRL 5',
  },
   {
    id: 'IDEA-006',
    validationId: 'VALID-006-001',
    title: 'Renewable Energy Grid Optimizer',
    description: 'AI model to predict energy production from solar/wind and optimize grid distribution.',
    collegeId: 'COL002',
    collegeName: 'Global School of Innovation',
    domain: 'Renewable Energy',
    innovatorId: 'INV002',
    innovatorName: 'Priya Singh',
    innovatorEmail: 'priya.s@example.com',
    status: 'Moderate',
    dateSubmitted: '2024-06-30',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-006', validationId: 'VALID-006-001', reportId: 'REPID-006-001-20240726', ideaName: 'Grid Optimizer', overallScore: 70, validationOutcome: 'Moderate'},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Not Requested',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    trl: 'TRL 3',
  },
];
