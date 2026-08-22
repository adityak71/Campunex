import { Request, Response } from 'express';
import { sendContactEmail } from '../../utils/mailer.js';

export async function handleContactSupport(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, issueType, message } = req.body;

    if (!name || !email || !issueType || !message) {
      res.status(400).json({ error: 'All fields (name, email, issueType, message) are required' });
      return;
    }

    try {
      // Call mailer utility to send the message
      await sendContactEmail(name, email, issueType, message);
      res.status(200).json({ message: 'Support message sent successfully' });
    } catch (emailError: any) {
      // Backup the enquiry in server logs since DB persistence isn't implemented for it yet
      console.log('[SUPPORT ENQUIRY BACKUP]', { name, email, issueType, message });
      res.status(200).json({ 
        message: 'Your message was received. Email notification is temporarily unavailable, but your enquiry has been recorded.' 
      });
    }
  } catch (error: any) {
    console.error('Contact Support Error:', error);
    res.status(500).json({ error: 'Failed to process support message' });
  }
}
