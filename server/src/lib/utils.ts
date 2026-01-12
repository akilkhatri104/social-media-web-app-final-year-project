import fs from 'fs/promises';
import mime from 'mime-types';

export async function base64_encode(file: string) {
  try {
    const buffer = await fs.readFile(file);
    const mimeType = mime.lookup(file);

    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('base64_encode :: ', error);
    throw error;
  }
}
