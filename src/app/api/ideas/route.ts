import { NextResponse } from 'next/server';
import { MOCK_IDEAS } from '@/lib/data/ideas';

export async function GET() {
  // In a real application, you would fetch this from a database.
  // You could also add authentication here to return ideas for the current user.
  try {
    // We remove the full report from the list view to keep the payload small.
    const ideasForListView = MOCK_IDEAS.map(idea => {
        const { report, ...rest } = idea;
        return rest;
    });
    return NextResponse.json(ideasForListView);
  } catch (error) {
    console.error('API Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}
