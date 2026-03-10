
// Google Drive Service for handling file selection via Google Picker API

// Types for Google Picker API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl?: string;
  accessToken?: string;
}

class GoogleDriveService {
  private developerKey: string = '';
  private clientId: string = '1022447215307-67nghlm1hv26vbieho7ho52gqhagpfj7.apps.googleusercontent.com';
  private appId: string = '1022447215307';

  private pickerApiLoaded: boolean = false;
  private oauthToken: string | null = null;

  constructor() {
    // Prioritize VITE_GOOGLE_PICKER_API_KEY, then VITE_GOOGLE_API_KEY, then Gemini key
    this.developerKey = (import.meta as any).env?.VITE_GOOGLE_PICKER_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY_1 || '';
  }

  /**
   * Load the Google Picker API
   */
  public loadPicker(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.pickerApiLoaded) {
        resolve();
        return;
      }

      if (!window.gapi) {
        reject(new Error('Google API script not loaded'));
        return;
      }

      window.gapi.load('picker', {
        callback: () => {
          this.pickerApiLoaded = true;
          resolve();
        },
        onerror: () => reject(new Error('Failed to load Google Picker API'))
      });
    });
  }

  /**
   * Authenticate with Google to get OAuth token
   */
  public authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        reject(new Error('Google Identity Services script not loaded'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error !== undefined) {
            reject(response);
          }
          this.oauthToken = response.access_token;
          resolve(response.access_token);
        },
      });

      if (this.oauthToken) {
        // Skip if we already have a token (simple check)
        // In a real app, we should check expiration
        resolve(this.oauthToken);
      } else {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    });
  }

  /**
   * Open the Google Picker to select files
   */
  public openPicker(options: {
    mimeTypes?: string;
    multiSelect?: boolean;
  }): Promise<DriveFile[]> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadPicker();

        if (!this.oauthToken) {
          await this.authenticate();
        }

        if (!this.developerKey) {
          reject(new Error('API Key is missing. Please check .env file.'));
          return;
        }

        const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
        docsView.setIncludeFolders(true);
        docsView.setParent('root');

        if (options.mimeTypes) {
          docsView.setMimeTypes(options.mimeTypes);
        }

        const pickerBuilder = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
          .setAppId(this.appId)
          .setOAuthToken(this.oauthToken!)
          .setDeveloperKey(this.developerKey)
          .addView(docsView)
          .addView(new window.google.picker.DocsUploadView())
          .setCallback((data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const files = data.docs.map((doc: any) => ({
                id: doc.id,
                name: doc.name,
                mimeType: doc.mimeType,
                size: doc.sizeBytes || 0,
                url: doc.url,
                accessToken: this.oauthToken
              }));
              resolve(files);
            } else if (data.action === window.google.picker.Action.CANCEL) {
              resolve([]);
            }
          });

        if (options.multiSelect) {
          pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        }

        const picker = pickerBuilder.build();
        picker.setVisible(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download a file from Google Drive using the access token
   */
  public async downloadFile(fileId: string, accessToken: string): Promise<Blob> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const googleDriveService = new GoogleDriveService();
