import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const ISSUES_FILE = path.join(DATA_DIR, 'issues.json');
const ENV_FILE = path.join(__dirname, '../../.env');

// Ensure data folder and issues.json exist
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ISSUES_FILE)) {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify([], null, 2));
  }
}

// Save issue report locally to JSON file so data is never lost
export function saveIssueLocally(report) {
  try {
    ensureDataStore();
    const existing = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8') || '[]');
    existing.unshift(report);
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(existing, null, 2));
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to save issue locally:', err);
    return false;
  }
}

export function getAllSavedIssues() {
  try {
    ensureDataStore();
    return JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8') || '[]');
  } catch {
    return [];
  }
}

function generateEmailHtml(report) {
  const dateFormatted = new Date(report.timestamp || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 24px; text-align: left;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">⚠️ New Issue Reported — MedCompare</h2>
        <p style="margin: 6px 0 0; opacity: 0.92; font-size: 14px;">A customer submitted feedback regarding medicine data or store links.</p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 140px;">Category:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">
              <span style="background: rgba(245, 158, 11, 0.12); color: #b45309; padding: 3px 8px; border-radius: 6px;">
                ${report.categoryLabel || report.category}
              </span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Medicine:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 700; font-size: 15px; color: #059669;">
              ${report.medicineName || '<em>Not specified</em>'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Platform:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${report.platform || 'All Stores / General'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 600; color: #64748b;">User Email:</td>
            <td style="padding: 10px 0; color: #0f172a;">
              ${report.email ? `<a href="mailto:${report.email}" style="color: #10b981; text-decoration: none; font-weight: 600;">${report.email}</a>` : '<em>Anonymous (No email provided)</em>'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Reported At:</td>
            <td style="padding: 10px 0; color: #475569; font-size: 13px;">${dateFormatted} (IST)</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 16px 20px; background: #f8fafc; border-left: 4px solid #10b981; border-radius: 8px;">
          <div style="font-weight: 700; margin-bottom: 8px; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">
            Customer Description:
          </div>
          <div style="color: #334155; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${report.description}</div>
        </div>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
        MedCompare Automated Issue Tracker • Saved in <code>server/data/issues.json</code>
      </div>
    </div>
  `;
}

// Send email notification using Nodemailer or Resend
export async function sendIssueNotificationEmail(report) {
  // Always load latest values from .env if present
  try {
    dotenv.config({ path: ENV_FILE, override: true });
  } catch {}

  // 1. Always save a permanent local copy
  saveIssueLocally(report);

  const subject = `[MedCompare Issue] ${report.categoryLabel || report.category}: ${report.medicineName || 'Feedback'}`;
  const htmlContent = generateEmailHtml(report);

  // 2. Primary: Nodemailer SMTP (Direct delivery to Inbox with authenticated user)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '465', 10);
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS.replace(/\s+/g, '') // remove spaces from app password
        }
      });

      const recipient = process.env.ALERT_EMAIL_TO || process.env.SMTP_USER;
      const sender = process.env.ALERT_EMAIL_FROM || `"MedCompare Alerts" <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from: sender,
        to: recipient,
        replyTo: report.email || undefined,
        subject,
        html: htmlContent
      });

      console.log(`[EmailService] Successfully sent issue email via Gmail SMTP to ${recipient}:`, info.messageId);
      return { success: true, provider: 'nodemailer', id: info.messageId, recipient };
    } catch (err) {
      console.error('[EmailService] Nodemailer SMTP failed, attempting fallback to Resend:', err.message);
    }
  }

  // 3. Fallback: Resend API (if configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const toEmail = process.env.ALERT_EMAIL_TO || 'raulosandeep93@gmail.com';
      const fromEmail = process.env.ALERT_EMAIL_FROM_RESEND || 'MedCompare Alerts <onboarding@resend.dev>';
      
      const res = await axios.post('https://api.resend.com/emails', {
        from: fromEmail,
        to: [toEmail],
        reply_to: report.email || undefined,
        subject,
        html: htmlContent
      }, {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });

      console.log('[EmailService] Successfully sent email notification via Resend:', res.data?.id);
      return { success: true, provider: 'resend', id: res.data?.id };
    } catch (err) {
      console.error('[EmailService] Resend email failed:', err.response?.data || err.message);
    }
  }

  // 4. Fallback if no SMTP or Resend credentials succeeded
  console.log('[EmailService] Issue recorded in server/data/issues.json. Live email dispatch could not complete.');
  return {
    success: true,
    provider: 'local_storage',
    savedLocally: true,
    note: 'Issue saved to server/data/issues.json. Set SMTP credentials or RESEND_API_KEY in server/.env to dispatch live emails.'
  };
}
