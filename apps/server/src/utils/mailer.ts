import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initialize Brevo SDK
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || 'MISSING_API_KEY';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a verification OTP email to the user.
 */
export async function sendVerificationEmail(toEmail: string, otp: string): Promise<void> {
  if (!apiKey.apiKey || apiKey.apiKey === 'MISSING_API_KEY') {
    console.warn(`[MAILER] No Brevo API Key found. Skipping email to ${toEmail}. OTP: ${otp}`);
    return;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = 'Campunex - Verify Your Institutional Email';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #0d9488;">Welcome to Campunex!</h2>
      <p>Thank you for registering. Please use the following 6-digit OTP to verify your institutional email address:</p>
      <div style="font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 4px; text-align: center; margin: 20px 0; background: #f0fdfa; padding: 10px; border-radius: 8px;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 12px;">This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: 'Campunex', email: 'noreply@campunex.com' };
  sendSmtpEmail.to = [{ email: toEmail }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[MAILER] OTP email sent successfully to ${toEmail}. MessageId:`, data.messageId);
  } catch (error) {
    console.error(`[MAILER] Failed to send OTP email to ${toEmail}:`, error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Sends a contact support message to the admin.
 */
export async function sendContactEmail(name: string, replyToEmail: string, issueType: string, message: string): Promise<void> {
  if (!apiKey.apiKey || apiKey.apiKey === 'MISSING_API_KEY') {
    console.warn(`[MAILER] No Brevo API Key found. Skipping contact email from ${replyToEmail}.`);
    return;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `[Campunex Support] ${issueType} - ${name}`;
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif;">
      <h3>New Support Request</h3>
      <p><strong>From:</strong> ${name} &lt;${replyToEmail}&gt;</p>
      <p><strong>Issue Category:</strong> ${issueType}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: 'Campunex Support System', email: 'noreply@campunex.com' };
  sendSmtpEmail.to = [{ email: 'support@campunex.com' }]; // Replace with actual admin email
  sendSmtpEmail.replyTo = { email: replyToEmail, name: name };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[MAILER] Contact email sent successfully. MessageId:`, data.messageId);
  } catch (error) {
    console.error(`[MAILER] Failed to send contact email:`, error);
    throw new Error('Failed to send contact email');
  }
}
