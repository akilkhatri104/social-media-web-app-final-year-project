import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiErrorResponse,
  type DeleteApiResponse,
} from 'cloudinary';
import { AppError } from '../middlewares/errorHandler.ts';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (
  buffer: Buffer<ArrayBufferLike>,
  resourceType: 'auto' | 'image' | 'video' | 'raw' | undefined = 'auto',
): Promise<UploadApiResponse> => {
  try {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourceType },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              return reject(error);
            }
            return resolve(uploadResult);
          },
        )
        .end(buffer);
    });
    return result;
  } catch (error) {
    console.error('uploadToCloudinary :: ', error);
    throw new AppError('Error while uploading media');
  }
};

export const deleteFromCloudinary = async (url: string) => {
  try {
    const publicId = getPublicId(url);

    if (!publicId) {
      throw new Error('Invalid public ID');
    }

    const result: DeleteApiResponse =
      await cloudinary.uploader.destroy(publicId);
    if (!result) {
      throw new Error('Error while deleting image');
    }

    return result;
  } catch (error) {
    console.error('deleteFromCloudinary :: ', error);
    throw new AppError('Error while deleting media');
  }
};

// Source - https://stackoverflow.com/a
// Posted by Aditya Pandey, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-12, License - CC BY-SA 4.0

const getPublicId = (imageURL: string) =>
  imageURL.split('/').pop()!.split('.')[0];
