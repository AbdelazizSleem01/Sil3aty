import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../../lib/dbConnect";
import { authOptions } from "../../../../../lib/authOptions";
import Contact from "../../../../../models/Contact";
import { sendEmail } from "../../../../../lib/email";

export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { response } = await request.json();

    if (!response?.trim()) {
      return NextResponse.json(
        { success: false, error: "Response is required" },
        { status: 400 }
      );
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    contact.response = response.trim();
    await contact.save();

    try {
      await sendEmail({
        to: contact.email,
        subject: "Response to Your Message - Sil3aty E-Commerce",
        text: `Dear ${contact.name},\n\nThank you for contacting us. Here is our response:\n\n${response}\n\nBest regards,\nSil3aty E-Commerce Team`,
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response to Your Message</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            
            .logo {
                max-width: 180px;
                height: auto;
                margin-bottom: 20px;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 300;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                color: #2d3748;
                margin-bottom: 25px;
                font-weight: 600;
            }
            
            .message-section {
                margin-bottom: 30px;
            }
            
            .message-label {
                font-size: 14px;
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .response-box {
                background: #f7fafc;
                border-left: 4px solid #4299e1;
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
            }
            
            .response-text {
                color: #2d3748;
                font-size: 15px;
                line-height: 1.7;
                white-space: pre-line;
            }
            
            .footer {
                background: #1a202c;
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .footer-logo {
                max-width: 120px;
                margin-bottom: 20px;
            }
            
            .company-info {
                margin-bottom: 25px;
            }
            
            .company-info p {
                margin: 5px 0;
                font-size: 14px;
                opacity: 0.8;
            }
            
            .social-links {
                margin: 25px 0;
            }
            
            .social-link {
                display: inline-block;
                margin: 0 12px;
                transition: transform 0.3s ease;
            }
            
            .social-link:hover {
                transform: translateY(-2px);
            }
            
            .social-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: white;
                padding: 6px;
            }
            
            .legal {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #2d3748;
            }
            
            .legal p {
                font-size: 12px;
                opacity: 0.6;
                line-height: 1.5;
                margin: 5px 0;
            }
            
            .contact-button {
                display: inline-block;
                background: #4299e1;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                transition: background 0.3s ease;
            }
            
            .contact-button:hover {
                background: #3182ce;
            }
            
            @media (max-width: 600px) {
                .header {
                    padding: 30px 20px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .footer {
                    padding: 30px 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header Section -->
            <div class="header">
                <a href="${process.env.NEXT_PUBLIC_API_URL}" target="_blank">
                    <img loading="lazy" 
                         src="https://ecommerce-Sil3aty.vercel.app/images/logo%20copy.png" 
                         alt="Sil3aty E-Commerce" 
                         class="logo">
                </a>
                <h1>Response to Your Message</h1>
                <p>We're here to help with your inquiry</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">
                    Dear ${contact.name},
                </div>
                
                <p style="color: #4a5568; margin-bottom: 20px; font-size: 15px;">
                    Thank you for reaching out to Sil3aty E-Commerce. We appreciate you taking the time to contact us and we're happy to assist you with your inquiry.
                </p>
                
                <div class="message-section">
                    <div class="message-label">Our Response:</div>
                    <div class="response-box">
                        <div class="response-text">${response}</div>
                    </div>
                </div>
                
                <p style="color: #4a5568; margin-bottom: 25px; font-size: 15px;">
                    If you have any additional questions or need further clarification, please don't hesitate to reply to this email. We're always here to help!
                </p>
                
                <a href="mailto:abdelazizsleem957@gmail.com" class="contact-button">
                    Contact Us Again
                </a>
                
                <p style="color: #718096; font-size: 14px; margin-top: 25px;">
                    Best regards,<br>
                    <strong>The Sil3aty E-Commerce Team</strong>
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <a href="${process.env.NEXT_PUBLIC_API_URL}" target="_blank">
                    <img loading="lazy" 
                         src="https://ecommerce-Sil3aty.vercel.app/images/logo%20copy.png" 
                         alt="Sil3aty E-Commerce" 
                         class="footer-logo">
                </a>
                
                <div class="company-info">
                    <p><strong>Sil3aty E-Commerce</strong></p>
                    <p>Benha, Qalyubia, EGYPT</p>
                    <p>Tel: +20 1012105407</p>
                    <p>Email: abdelazizsleem957@gmail.com</p>
                </div>
                
                <!-- Social Links -->
                <div class="social-links">
                    <a href="https://www.facebook.com/profile.php?id=100028557526450" class="social-link" target="_blank">
                        <img loading="lazy" 
                             src="https://cdn-icons-png.flaticon.com/512/124/124010.png" 
                             alt="Facebook" 
                             class="social-icon">
                    </a>
                    <a href="https://www.linkedin.com/in/abdelaziz-sleem-600a1027a/" class="social-link" target="_blank">
                        <img loading="lazy" 
                             src="https://cdn-icons-png.flaticon.com/512/174/174857.png" 
                             alt="LinkedIn" 
                             class="social-icon">
                    </a>
                    <a href="https://github.com/AbdelazizSleem01" class="social-link" target="_blank">
                        <img loading="lazy" 
                             src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                             alt="GitHub" 
                             class="social-icon">
                    </a>
                </div>
                
                <!-- Legal Text -->
                <div class="legal">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                    <p>© ${new Date().getFullYear()} Sil3aty E-Commerce. All rights reserved.</p>
                    <p><a href="${
                      process.env.NEXT_PUBLIC_API_URL
                    }/privacy" style="color: #90cdf4; text-decoration: none;">Privacy Policy</a> | 
                       <a href="${
                         process.env.NEXT_PUBLIC_API_URL
                       }/terms" style="color: #90cdf4; text-decoration: none;">Terms of Service</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,
      });
    } catch (emailError) {}

    return NextResponse.json(
      {
        success: true,
        message: "Response updated and email sent successfully",
        data: contact,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete Fun

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
