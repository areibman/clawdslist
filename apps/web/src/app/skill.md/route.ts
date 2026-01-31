import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const skillMdPath = join(process.cwd(), 'src/content/skill.md');
    const content = readFileSync(skillMdPath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error reading skill.md:', error);
    return new NextResponse('# Error\n\nFailed to load skill.md', {
      status: 500,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  }
}

