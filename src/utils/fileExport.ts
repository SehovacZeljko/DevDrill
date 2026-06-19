import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export interface ExportResult {
  success: boolean;
  message: string;
}

export async function exportLessonsPdf(pdfPath: string, fileName: string): Promise<ExportResult> {
  if (Platform.OS === 'android') {
    return saveToAndroidDownloads(pdfPath, fileName);
  }
  return shareOnIos(pdfPath, fileName);
}

async function saveToAndroidDownloads(pdfPath: string, fileName: string): Promise<ExportResult> {
  const hasPermission = await requestAndroidStoragePermission();
  if (!hasPermission) {
    return { success: false, message: 'Storage permission was denied, so the PDF could not be saved.' };
  }

  const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  await RNFS.copyFile(pdfPath, downloadPath);
  return { success: true, message: `PDF saved to Downloads as ${fileName}.` };
}

async function requestAndroidStoragePermission(): Promise<boolean> {
  const androidApiLevel =
    typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
  if (androidApiLevel >= 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function shareOnIos(pdfPath: string, fileName: string): Promise<ExportResult> {
  await Share.open({
    url: `file://${pdfPath}`,
    filename: fileName,
    title: fileName,
    type: 'application/pdf',
    failOnCancel: false,
  });
  return { success: true, message: 'Choose "Save to Files" in the share sheet to keep the PDF.' };
}
