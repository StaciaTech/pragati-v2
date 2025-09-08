
import { NextResponse, type NextRequest } from 'next/server';
import { generateValidationReport } from '@/ai/flows/generate-validation-report';
import { MOCK_IDEAS } from '@/lib/data/ideas';
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
    const reportId = `REPID-${String(MOCK_IDEAS.length + 1).padStart(3, '0')}-001-${Date.now()}`;
    
    console.log(`Generating report for Idea: ${ideaId}, Validation: ${validationId}, Report: ${reportId}`);

    // Call the Genkit flow to get the validation report
    const report: ValidationReport = await generateValidationReport({
      ideaId,
      validationId,
      ideaName: title,
      ideaConcept: description,
      category: domain,
      institution: "Pragati University (Mock)", // This would come from user context
    });

    // Add the generated reportId to the report object
    report.reportId = reportId;

    // Simulate saving to a database by adding to our mock data array
    const newIdea = {
      id: ideaId,
      validationId: validationId,
      title: report.ideaName,
      description: report.ideaConcept,
      collegeId: 'COL001',
      collegeName: 'Pragati Institute of Technology',
      domain: domain,
      innovatorId: 'INV001', // Mock data - associate with Jane Doe
      innovatorName: 'Jane Doe', // Mock data
      innovatorEmail: 'jane.doe@example.com', // Mock data
      status: report.validationOutcome,
      dateSubmitted: new Date().toISOString().split('T')[0],
      version: 'V1.0',
      report: report, // Store the full report object
      clusterWeights: {}, // This is now embedded in the report, can be removed
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
