import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { type, region, title, content, language } = body;
    
    if (!type || !region || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Validate the contributor (wallet connection, trust score)
    // 2. Upload audio file to IPFS if present
    // 3. Store story in Supabase
    // 4. Calculate and distribute RLUSD rewards
    // 5. Mint StoryNode NFT if eligible
    // Note: AI summarization is disabled for now

    const mockStory = {
      id: `story-${Date.now()}`,
      title,
      content,
      type,
      region,
      language,
      contributorId: 'mock-contributor',
      contributor: {
        id: 'mock-contributor',
        username: 'Anonymous',
        trustScore: 50,
        region,
        storyCount: 1,
        hasStoryNodeNFT: false,
        createdAt: new Date().toISOString()
      },
      trustScore: 50,
      upvotes: 0,
      downvotes: 0,
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      story: mockStory,
      message: 'Story submitted successfully! You earned 2 RLUSD for this contribution.'
    });

  } catch (error) {
    console.error('Error submitting story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // In production, this would fetch from Supabase
    // with proper filtering and pagination

    const mockStories = [
      {
        id: '1',
        title: 'Local Market Update',
        content: 'The downtown market is bustling with new vendors this week.',
        type: 'user_story',
        region: 'new-york',
        contributorId: 'contributor-1',
        contributor: {
          id: 'contributor-1',
          username: 'LocalReporter',
          trustScore: 85,
          region: 'new-york',
          storyCount: 12,
          hasStoryNodeNFT: true,
          createdAt: '2024-01-15T10:00:00Z'
        },
        trustScore: 85,
        upvotes: 23,
        downvotes: 2,
        tags: ['market', 'local-business'],
        language: 'en',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      }
    ];

    return NextResponse.json({
      stories: mockStories,
      total: mockStories.length
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 