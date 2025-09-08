
'use client';

import { MOCK_IDEAS } from './ideas';

export const approvalRatesByDomain = MOCK_IDEAS.reduce((acc, idea) => {
    if (!acc[idea.domain]) {
      acc[idea.domain] = { total: 0, approved: 0 };
    }
    acc[idea.domain].total++;
    if (idea.status === 'Approved') {
      acc[idea.domain].approved++;
    }
    return acc;
  }, {} as Record<string, { total: number; approved: number }>);

export const domainTrends = Object.entries(approvalRatesByDomain).map(([domain, data]) => ({
    domain,
    approvalRate: data.total > 0 ? ((data.approved / data.total) * 100) : 0,
    totalIdeas: data.total,
}));

export const submissionsByCollege = MOCK_IDEAS.reduce((acc, idea) => {
    acc[idea.collegeName] = (acc[idea.collegeName] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

export const collegeSubmissionData = Object.entries(submissionsByCollege)
    .map(([name, submissions], index) => ({ 
        name, 
        submissions,
        fill: `hsl(var(--chart-${index + 1}))`
    }))
    .sort((a, b) => b.submissions - a.submissions);

export const invitedVsActiveData = [
  { name: 'Active Innovators', value: 8, fill: 'hsl(var(--chart-1))' },
  { name: 'Invited Innovators', value: 2, fill: 'hsl(var(--chart-5))' }
];

export const ideaQualityData = [
  { month: 'Jan', quality: 3.2 },
  { month: 'Feb', quality: 3.5 },
  { month: 'Mar', quality: 3.4 },
  { month: 'Apr', quality: 4.1 },
  { month: 'May', quality: 4.3 },
  { month: 'Jun', quality: 4.0 },
];

export const rejectionReasonsData = [
    { name: 'Low Market Need', value: 40, fill: 'hsl(var(--color-rejected))' },
    { name: 'Technical Feasibility', value: 30, fill: 'hsl(var(--chart-3))' },
    { name: 'Weak Business Model', value: 20, fill: 'hsl(var(--chart-5))' },
    { name: 'Poor Team Fit', value: 10, fill: 'hsl(var(--muted))' },
];

export const categorySuccessData = [
  { category: 'HealthTech', approved: 5, moderate: 8, rejected: 3 },
  { category: 'EdTech', approved: 8, moderate: 12, rejected: 5 },
  { category: 'FinTech', approved: 12, moderate: 7, rejected: 2 },
  { category: 'Agriculture', approved: 6, moderate: 10, rejected: 8 },
];
