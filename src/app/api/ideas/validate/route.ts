
import { NextResponse, type NextRequest } from 'next/server';
import { generateValidationReport } from '@/ai/flows/generate-validation-report';
import { MOCK_IDEAS } from '@/lib/mock-data';
import type { ValidationReport } from '@/ai/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, domain } = body;

    if (!title || !description || !domain) {
      return NextResponse.json({ error: 'Missing required fields: title, description, domain' }, { status: 400 });
    }

    // Generate new IDs
    const ideaId = `IDEA-${String(MOCK_IDEAS.length + 1).padStart(3, '0')}`;
    const validationId = `VALID-${String(MOCK_IDEAS.length + 1).padStart(3, '0')}-001`;
    
    console.log(`Generating report for Idea: ${ideaId}, Validation: ${validationId}`);

    // Call the Genkit flow to get the validation report
    // This part is now simplified as we are using a static mock report.
    // In a real scenario, the generateValidationReport flow would be called here.
    const report: ValidationReport | null = MOCK_IDEAS[0].report; // Using the first idea's report as a template
    
    if (!report) {
      return NextResponse.json({ error: 'Failed to generate report template.' }, { status: 500 });
    }

    // Update the report with new idea details
    const newReport = {
        ...report,
        ideaName: title,
        outcome: report.overallScore >= 80 ? "High Potential" : report.overallScore >= 60 ? "Moderate" : "Needs Improvement",
    };

    // Simulate saving to a database by adding to our mock data array
    const newIdea = {
      id: ideaId,
      validationId: validationId,
      title: title,
      description: description,
      collegeId: 'COL001',
      collegeName: 'Pragati Institute of Technology',
      domain: domain,
      innovatorId: 'INV001', // Mock data - associate with Jane Doe
      innovatorName: 'Jane Doe', // Mock data
      innovatorEmail: 'jane.doe@example.com', // Mock data
      status: newReport.outcome,
      dateSubmitted: new Date().toISOString().split('T')[0],
      version: 'V1.0',
      report: newReport, // Store the full report object
      clusterWeights: {},
      feedback: null,
      consultationStatus: 'Not Requested',
      consultationDate: null,
      consultationTime: null,
      ttcAssigned: null,
    };
    MOCK_IDEAS.unshift(newIdea);

    return NextResponse.json({
      message: 'Idea validated and saved successfully!',
      idea: newIdea,
    });

  } catch (error) {
    console.error('Validation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to validate idea', details: errorMessage }, { status: 500 });
  }
}
