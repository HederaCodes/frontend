import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, query } = body;
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Call the backend API using Fetch API
    const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/api/assistant/code-agent`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        query
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error from backend service',
          message: errorData.error || `Server responded with status: ${response.status}`
        },
        { status: response.status }
      );
    }
    
    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling code-agent API:', error);
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}