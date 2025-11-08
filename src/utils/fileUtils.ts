import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Utilidades para manejo de archivos
 */

/**
 * Asegura que un directorio existe
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Guarda JSON a archivo
 */
export function saveJSON(filepath: string, data: any): void {
  ensureDir(path.dirname(filepath));
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Lee JSON desde archivo
 */
export function readJSON(filepath: string): any {
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Guarda YAML a archivo
 */
export function saveYAML(filepath: string, data: any): void {
  ensureDir(path.dirname(filepath));
  const yamlContent = yaml.dump(data);
  fs.writeFileSync(filepath, yamlContent, 'utf-8');
}

/**
 * Lee YAML desde archivo
 */
export function readYAML(filepath: string): any {
  const content = fs.readFileSync(filepath, 'utf-8');
  return yaml.load(content);
}

/**
 * Guarda texto a archivo
 */
export function saveText(filepath: string, content: string): void {
  ensureDir(path.dirname(filepath));
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Copia archivo
 */
export function copyFile(source: string, destination: string): void {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

/**
 * Lista archivos en directorio
 */
export function listFiles(dirPath: string, extension?: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  if (extension) {
    return files.filter(f => f.endsWith(extension));
  }

  return files;
}

/**
 * Obtiene tamaño de archivo en MB
 */
export function getFileSizeMB(filepath: string): number {
  const stats = fs.statSync(filepath);
  return stats.size / (1024 * 1024);
}
