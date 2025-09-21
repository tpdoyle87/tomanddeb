import { NextResponse } from 'next/server';
import { z } from 'zod';
import { siteConfig } from '@/config/site';

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Valid email is required').max(100, 'Email must be less than 100 characters'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = contactFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(err => ({
            path: err.path,
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // Get client IP and user agent for basic spam protection
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Basic spam protection - check for common patterns
    const spamPatterns = [
      /casino/i,
      /poker/i,
      /viagra/i,
      /cialis/i,
      /loan/i,
      /bitcoin/i,
      /crypto/i,
      /investment.*guaranteed/i,
      /make.*money.*fast/i,
      /click.*here/i,
      /bit\.ly/i,
      /tinyurl/i,
      /www\./i, // Suspicious if message contains many URLs
    ];

    const fullText = `${subject} ${message}`.toLowerCase();
    const isSpam = spamPatterns.some(pattern => pattern.test(fullText));

    if (isSpam) {
      console.log('Potential spam detected:', { name, email, subject, clientIp });
      return NextResponse.json(
        { error: 'Message flagged as spam' },
        { status: 422 }
      );
    }

    // Rate limiting check (simple IP-based)
    // In a production environment, you'd want to use a proper rate limiting solution
    // like Redis or a rate limiting service

    // For now, we'll just log the contact form submission
    // In a real application, you might want to:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with a CRM
    // 4. Send auto-reply email

    const contactData = {
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toISOString(),
      clientIp,
      userAgent,
    };

    // Log the submission (replace with your preferred logging solution)
    console.log('Contact form submission:', contactData);

    // In a production environment, you might want to:
    // 1. Save to a database table
    // 2. Send email using a service like SendGrid, Mailgun, or AWS SES
    // 3. Add to a CRM system
    // 4. Send auto-reply confirmation

    // Example of what you might do in production:
    /*
    // Save to database
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: clientIp,
        userAgent,
        status: 'PENDING',
      },
    });

    // Send email notification to admin
    await sendNotificationEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Send auto-reply to user
    await sendAutoReplyEmail({
      to: email,
      name,
      subject: `Thank you for contacting us, ${name}`,
      html: getAutoReplyTemplate(name),
    });
    */

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose internal errors to the client
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Helper function for auto-reply template (if needed)
function getAutoReplyTemplate(name: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #20b2aa;">Thank you for reaching out!</h2>
          
          <p>Hi ${name},</p>
          
          <p>Thank you for contacting us! We have received your message and will get back to you within 24-48 hours.</p>
          
          <p>In the meantime, feel free to:</p>
          <ul>
            <li>Browse our latest <a href="${process.env.NEXT_PUBLIC_BASE_URL}/blog">blog posts</a></li>
            <li>Follow our journey on social media</li>
            <li>Subscribe to our newsletter for travel tips and photography</li>
          </ul>
          
          <p>Best regards,<br>
          ${siteConfig.admin.teamName}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}