export async function uploadToR2(file: any, key: string): Promise<string> {
  console.log(`[R2 Stub] Uploading to ${key}`);
  return `https://storage.zeal.com/${key}`;
}
