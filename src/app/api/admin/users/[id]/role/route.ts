import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// Update user role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Only admins can change user roles
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const adminUser = authResult;

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ADMIN, EDITOR, AUTHOR, READER' },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (adminUser.id === id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You cannot demote your own admin account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if this would remove the last admin
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin. Promote another user to admin first.' },
          { status: 400 }
        );
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    // Log the role change for audit purposes
    console.log(`Admin ${adminUser.id} changed role of user ${id} from ${user.role} to ${role}`);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}