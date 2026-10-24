import { getAccessToken } from './firebase.js';

export interface DriveExportResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

/**
 * Creates a file in the user's Google Drive containing research notes or blueprints.
 * Respects mandatory confirmation dialog constraint before mutating Drive data.
 */
export async function exportToGoogleDrive(
  title: string,
  content: string,
  mimeType: string = 'text/markdown'
): Promise<DriveExportResult> {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google Drive authorization is required. Please sign in with Google.',
    };
  }

  try {
    const filename = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    const metadata = {
      name: filename,
      mimeType: mimeType,
      description: 'Exported from The Genesis of Machine Cognition Virtual Lab',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    };
  } catch (error: any) {
    console.error('Drive export error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export file to Google Drive',
    };
  }
}
