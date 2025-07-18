import multer from "multer";
import multerS3 from "multer-s3";
import axios from "axios";
import s3 from "../utils/s3";
import { v4 as uuid } from 'uuid';
import { PutObjectCommand } from "@aws-sdk/client-s3";

const upload = multer({
   storage: multerS3({
      s3,
      bucket: "cric-play",
      key: (_, file, cb) => {
         cb(null, `logos/${Date.now()}-${file.originalname}`);
      },
   }),
});

export const uploadImageFromUrl = async (imageUrl: string): Promise<string | null> => {
  try {
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const fileName = `players/${uuid()}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: 'cric-play',
        Key: fileName,
        Body: res.data,
        ContentType: 'image/jpeg',
      })
    );

    return `https://cric-play.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error('Error uploading profile image:', err);
    return null;
  }
};
export default upload;
