import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single image buffer to Cloudinary.
 * Returns the secure URL.
 */
export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided.' });
  }

  const { buffer, mimetype } = req.file;

  // Validate mime type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(mimetype)) {
    return res.status(400).json({ error: 'Unsupported image type.' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'itinerary/memories', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      Readable.from(buffer).pipe(stream);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Image upload failed.' });
  }
}
