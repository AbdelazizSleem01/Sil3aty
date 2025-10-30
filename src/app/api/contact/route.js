import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Contact from "../../../../models/Contact";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { sendEmail } from "../../../../lib/email";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  const mongooseSession = await mongoose.startSession();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      throw new Error("All fields are required");
    }

    await mongooseSession.withTransaction(async () => {
      const newContact = await Contact.create(
        [
          {
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          },
        ],
        { session: mongooseSession }
      );

      await sendEmail({
        to: email,
        subject: "Message Received Successfully - Sil3aty E-Commerce",
        text: `Dear ${name.trim()},\n\nThank you for contacting Sil3aty E-Commerce! We've received your message and our team will get back to you within 24-48 hours.\n\nBest regards,\nSil3aty E-Commerce Team`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Message Received</title>
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
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
                  
                  .success-icon {
                      text-align: center;
                      font-size: 48px;
                      color: #10b981;
                      margin-bottom: 20px;
                  }
                  
                  .message-preview {
                      background: #f7fafc;
                      border-left: 4px solid #10b981;
                      padding: 20px;
                      border-radius: 8px;
                      margin: 20px 0;
                  }
                  
                  .message-preview p {
                      color: #2d3748;
                      font-size: 15px;
                      line-height: 1.7;
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
                      <a href="${
                        process.env.NEXT_PUBLIC_API_URL
                      }" target="_blank">
                          <img loading="lazy" 
                               src="https://ecommerce-Sil3aty.vercel.app/images/logo%20copy.png" 
                               alt="Sil3aty E-Commerce" 
                               class="logo">
                      </a>
                      <h1>Message Received ✓</h1>
                      <p>We've got your message and we're on it!</p>
                  </div>
                  
                  <!-- Main Content -->
                  <div class="content">
                      <div class="success-icon">✓</div>
                      
                      <div class="greeting">
                          Dear ${name},
                      </div>
                      
                      <p style="color: #4a5568; margin-bottom: 20px; font-size: 15px;">
                          Thank you for reaching out to Sil3aty E-Commerce! We've successfully received your message and our team is already reviewing it.
                      </p>
                      
                      <div class="message-preview">
                          <p><strong>Your Message Preview:</strong></p>
                          <p style="margin-top: 10px; font-style: italic;">
                              "${
                                message.length > 150
                                  ? message.substring(0, 150) + "..."
                                  : message
                              }"
                          </p>
                      </div>
                      
                      <p style="color: #4a5568; margin-bottom: 25px; font-size: 15px;">
                          We typically respond within <strong>24-48 hours</strong>. If your inquiry is urgent, please feel free to call us at <strong>+20 1012105407</strong>.
                      </p>
                      
                      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
                          Best regards,<br>
                          <strong>The Sil3aty E-Commerce Team</strong>
                      </p>
                  </div>
                  
                  <!-- Footer -->
                  <div class="footer">
                      <a href="${
                        process.env.NEXT_PUBLIC_API_URL
                      }" target="_blank">
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

      const admins = await User.find({ isAdmin: true })
        .select("_id email")
        .session(mongooseSession);

      const notification = await Notification.create(
        [
          {
            message: `New contact message from ${name}`,
            link: `/admin/contacts`,
            recipients: admins.map((admin) => admin._id),
            type: "contacts",
            relatedUser: session.user.id,
            metadata: {
              subject: subject,
              preview:
                message.length > 50
                  ? `${message.substring(0, 50)}...`
                  : message,
              fromEmail: email,
            },
          },
        ],
        { session: mongooseSession }
      );

      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);
      if (adminEmails.length > 0) {
        await sendEmail({
          to: adminEmails,
          subject: `📩 New Contact Message: ${subject}`,
          text: `You have received a new contact message:\n\nFrom: ${name} (${email})\nSubject: ${subject}\nMessage: ${message}\n\nPlease respond within 24-48 hours.\n\n---\nSil3aty E-Commerce Admin Panel`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Message</title>
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
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    
                    .logo {
                        max-width: 150px;
                        height: auto;
                        margin-bottom: 15px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    
                    .content {
                        padding: 30px;
                    }
                    
                    .alert-badge {
                        background: #fef3c7;
                        color: #92400e;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        display: inline-block;
                        margin-bottom: 20px;
                    }
                    
                    .message-details {
                        background: #f8fafc;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    
                    .detail-row {
                        margin-bottom: 10px;
                        display: flex;
                    }
                    
                    .detail-label {
                        font-weight: 600;
                        color: #4b5563;
                        min-width: 80px;
                    }
                    
                    .detail-value {
                        color: #1f2937;
                        flex: 1;
                    }
                    
                    .message-content {
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 15px 0;
                        line-height: 1.6;
                    }
                    
                    .action-button {
                        display: inline-block;
                        background: #3b82f6;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        margin: 15px 0;
                        transition: background 0.3s ease;
                    }
                    
                    .action-button:hover {
                        background: #2563eb;
                    }
                    
                    .footer {
                        background: #1a202c;
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .footer p {
                        font-size: 12px;
                        opacity: 0.7;
                        margin: 5px 0;
                    }
                    
                    @media (max-width: 600px) {
                        .header, .content, .footer {
                            padding: 20px;
                        }
                        
                        .detail-row {
                            flex-direction: column;
                        }
                        
                        .detail-label {
                            margin-bottom: 5px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header Section -->
                    <div class="header">
                        <a href="${
                          process.env.NEXT_PUBLIC_API_URL
                        }" target="_blank">
                            <img loading="lazy" 
                                 src="https://ecommerce-Sil3aty.vercel.app/images/logo%20copy.png" 
                                 alt="Sil3aty E-Commerce" 
                                 class="logo">
                        </a>
                        <h1>New Contact Message</h1>
                        <p>Action Required - Customer Inquiry</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <div class="alert-badge">📩 New Message Received</div>
                        
                        <div class="message-details">
                            <div class="detail-row">
                                <span class="detail-label">From:</span>
                                <span class="detail-value">${name} (${email})</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span class="detail-value">${subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Received:</span>
                                <span class="detail-value">${new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div>
                            <strong>Message Content:</strong>
                            <div class="message-content">
                                ${message.replace(/\n/g, "<br>")}
                            </div>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
                            Please respond to this inquiry within <strong>24-48 hours</strong> to ensure excellent customer service.
                        </p>
                        
                        <a href="${process.env.NEXT_PUBLIC_ADMIN_URL}/contacts" 
                           class="action-button">
                            📋 View in Admin Panel
                        </a>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p>This is an automated notification from Sil3aty E-Commerce Admin System</p>
                        <p>© ${new Date().getFullYear()} Sil3aty E-Commerce. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
          `,
        });
      }
    });

    await mongooseSession.commitTransaction();
    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (mongooseSession.inTransaction()) {
      await mongooseSession.abortTransaction();
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.message === "All fields are required" ? 400 : 500 }
    );
  } finally {
    await mongooseSession.endSession();
  }
}
