import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs';
import path from 'node:path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const currentDir = process.cwd();
  let apiFiles: string[] = [];
  let libFiles: string[] = [];
  let testJsDirFiles: string[] = [];

  try {
    apiFiles = fs.readdirSync(path.join(currentDir, 'api'));
  } catch (e: any) {
    apiFiles = [e.message];
  }

  try {
    libFiles = fs.readdirSync(path.join(currentDir, 'api', '_lib'));
  } catch (e: any) {
    libFiles = [e.message];
  }

  let importWithJsResult = null;
  let importWithJsError = null;
  try {
    const mod = await import('./_lib/email.js');
    importWithJsResult = !!mod;
  } catch (e: any) {
    importWithJsError = { message: e.message, code: e.code };
  }

  res.status(200).json({
    cwd: currentDir,
    apiFiles,
    libFiles,
    importWithJsResult,
    importWithJsError,
  });
}
