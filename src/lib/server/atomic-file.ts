import { readFile, writeFile, rename, copyFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

// escrita atomica com backup rotacionado (.bak) para salvar estado no disco
// evita corromper o json se o processo for interrompido durante a gravacao

export async function atomicWriteJson(filePath: string, content: string): Promise<void> {
  // faz backup da versao anterior antes de sobrescrever
  try {
    await copyFile(filePath, `${filePath}.bak`);
  } catch (err: any) {
    if (!err || err.code !== 'ENOENT') {
      // ignora erro ao rotacionar backup para nao travar o fluxo
    }
  }

  const tmpPath = `${filePath}.tmp-${process.pid}-${randomBytes(4).toString('hex')}`;
  await writeFile(tmpPath, content, 'utf8');
  await rename(tmpPath, filePath);
}

// le o arquivo json com fallback para o .bak se o principal estiver corrompido
export async function readJsonWithFallback(filePath: string): Promise<{ raw: string; recoveredFromBackup: boolean } | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    JSON.parse(raw);
    return { raw, recoveredFromBackup: false };
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      try {
        const backupRaw = await readFile(`${filePath}.bak`, 'utf8');
        JSON.parse(backupRaw);
        console.error(`Estado principal corrompido em ${filePath}; recuperado via .bak`);
        return { raw: backupRaw, recoveredFromBackup: true };
      } catch {
        throw err;
      }
    }
    if (err && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}
