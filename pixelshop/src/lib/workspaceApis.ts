import { getAccessToken } from './workspaceAuth';

/**
 * Base64URL-encoders a normal Unicode string for standard Gmail raw emails.
 */
function base64urlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 1. GOOGLE CALENDAR API INTEGRATION
 * Exports a scheduled marketing promotion directly into user's Google Calendar.
 */
export async function exportToGoogleCalendar(
  title: string,
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  platform: string,
  format: string,
  caption: string
): Promise<{ id: string; htmlLink: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Workspace belum terhubung. Tolong masuk terlebih dahulu.');
  }

  // Calculate start and end Times (Default: 1 Hour duration)
  const startTime = `${date}T${time || '12:00'}:00`;
  
  // Robust end time calculation
  let hour = 13;
  let min = 0;
  if (time && time.includes(':')) {
    const parts = time.split(':');
    hour = parseInt(parts[0], 10) || 12;
    min = parseInt(parts[1], 10) || 0;
  }
  let endHour = hour + 1;
  let endDate = date;
  if (endHour >= 24) {
    endHour = 23;
    min = 59;
  }
  const endHourStr = String(endHour).padStart(2, '0');
  const endMinStr = String(min).padStart(2, '0');
  const endTime = `${endDate}T${endHourStr}:${endMinStr}:00`;

  const description = `📢 Platform Media: ${platform.toUpperCase()}\n🎬 Format Postingan: ${format}\n\n📄 Copy Salinan Konten:\n"${caption || 'Belum ada copy konten.'}"\n\n=== Dibuat otomatis oleh PixelShop AI ===`;

  const body = {
    summary: `[PixelShop] ${title} (${platform.toUpperCase()})`,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'Asia/Jakarta'
    },
    end: {
      dateTime: endTime,
      timeZone: 'Asia/Jakarta'
    },
    reminders: {
      useDefault: true
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson?.error?.message || 'Gagal mengirim agenda ke Google Calendar.');
  }

  return response.json();
}

/**
 * 2. GMAIL API INTEGRATION
 * Sends a drafting email directly via user's connected Gmail sandbox.
 */
export async function sendEmailViaGmail(
  toEmail: string,
  subject: string,
  bodyText: string
): Promise<{ id: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Workspace belum terhubung. Tolong masuk terlebih dahulu.');
  }

  // Format compliant plain text RFC822 string
  const emailContent = [
    `To: ${toEmail}`,
    `Subject: =?utf-8?B?${base64urlEncode(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    bodyText
  ].join('\r\n');

  const rawBase64Url = base64urlEncode(emailContent);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawBase64Url
    })
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson?.error?.message || 'Gagal mengirim email via Gmail Anda.');
  }

  return response.json();
}

/**
 * 3. GOOGLE DRIVE API INTEGRATION
 * Uploads a file (text copy or catalogue CSV backup) using multipart upload.
 */
export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileContent: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Workspace belum terhubung. Tolong masuk terlebih dahulu.');
  }

  const boundary = 'boundary_pixelshop_multipart_uploader';
  const metadata = {
    name: fileName,
    mimeType: mimeType
  };

  // Construct standard multipart payload
  const multipartBody = [
    `\r\n--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    fileContent,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson?.error?.message || 'Gagal mengunggah berkas ke Google Drive.');
  }

  return response.json();
}
