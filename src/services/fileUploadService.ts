
import { supabase } from '@/integrations/supabase/client';

export class FileUploadService {
  static async uploadMessageAttachment(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  static async deleteAttachment(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('message-attachments')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  static getFilePathFromUrl(url: string): string {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'message-attachments');
    return urlParts.slice(bucketIndex + 1).join('/');
  }
}
