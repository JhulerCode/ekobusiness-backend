import { Client } from "minio";
import config from "../config.js";

export const minioClient = new Client({
    endPoint: config.MINIO_DOMAIN,
    useSSL: true,
    accessKey: config.MINIO_USER,
    secretKey: config.MINIO_PASSWORD,
    pathStyle: true
});

export const minioDomain = config.MINIO_DOMAIN;
export const minioBucket = config.MINIO_BUCKET;

export async function minioPutObject(file) {
    const timestamp = Date.now()
    const uniqueName = `${timestamp}-${file.originalname}`

    await minioClient.putObject(
        minioBucket,
        uniqueName,
        file.buffer,
        file.size,
        { "Content-Type": file.mimetype }
    )

    const publicUrl = `https://${minioDomain}/${minioBucket}/${uniqueName}`

    return {
        id: uniqueName,
        name: file.originalname,
        url: publicUrl,
    }
}

export async function minioRemoveObject(id) {
    try {
        await minioClient.removeObject(minioBucket, id)
        return true
    }
    catch (err) {
        console.error(`Error al eliminar ${id}:`, err.message)
        return false
    }
}