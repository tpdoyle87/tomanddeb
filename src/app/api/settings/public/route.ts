import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all public settings
    const settings = await prisma.settings.findMany({
      where: {
        isPublic: true
      },
      select: {
        key: true,
        value: true,
        type: true
      }
    });

    // Convert array to object for easier access
    const settingsObject = settings.reduce((acc, setting) => {
      // Parse JSON values if type is JSON
      if (setting.type === 'JSON') {
        try {
          acc[setting.key] = JSON.parse(setting.value as string);
        } catch {
          acc[setting.key] = setting.value;
        }
      } else if (setting.type === 'BOOLEAN') {
        acc[setting.key] = setting.value === 'true';
      } else if (setting.type === 'NUMBER') {
        acc[setting.key] = parseFloat(setting.value as string);
      } else {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ 
      success: true, 
      settings: settingsObject 
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}