import { Request, Response } from 'express';
import { sendContactEmail } from '../../utils/mailer.js';

export async function handleContactSupport(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, issueType, message } = req.body;

    if (!name || !email || !issueType || !message) {
      res.status(400).json({ error: 'All fields (name, email, issueType, message) are required' });
      return;
    }

    // Call mailer utility to send the message
    await sendContactEmail(name, email, issueType, message);

    res.status(200).json({ message: 'Support message sent successfully' });
  } catch (error: any) {
    console.error('Contact Support Error:', error);
    res.status(500).json({ error: 'Failed to send support message' });
  }
}
