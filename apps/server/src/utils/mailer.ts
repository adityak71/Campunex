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
    console.warn(`[MAILER] No Brevo API Key found. Skipping email to ${toEmail}.`);
    return;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Campunex - Campus Ridesharing';

  if (!senderEmail) {
    console.warn(`[MAILER] BREVO_SENDER_EMAIL not configured. Cannot send email to ${toEmail}.`);
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
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: toEmail }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[MAILER] OTP email sent successfully to ${toEmail}. MessageId:`, data.messageId);
  } catch (error: any) {
    const errorMsg = error.response?.body?.message || error.message || 'Unknown Brevo Error';
    console.error(`[MAILER] Brevo email failed. purpose=verification recipient=${toEmail} error=${errorMsg}`);
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

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Campunex - Campus Ridesharing';
  const supportEmail = process.env.BREVO_SUPPORT_EMAIL;

  if (!senderEmail || !supportEmail) {
    console.warn(`[MAILER] BREVO_SENDER_EMAIL or BREVO_SUPPORT_EMAIL not configured. Cannot send support email.`);
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
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: supportEmail }];
  sendSmtpEmail.replyTo = { email: replyToEmail, name };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[MAILER] Support email sent successfully. MessageId:`, data.messageId);
  } catch (error: any) {
    const errorMsg = error.response?.body?.message || error.message || 'Unknown Brevo Error';
    console.error(`[MAILER] Brevo email failed. purpose=contact recipient=${supportEmail} error=${errorMsg}`);
    throw new Error('Failed to send contact email');
  }
}
