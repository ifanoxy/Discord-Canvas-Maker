import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateNodeCanvasCode } from './exportCode';
import type { CanvasImage } from '../types';

export const exportProjectToZip = async (files: CanvasImage[] | any[], language: 'typescript' | 'javascript' = 'typescript') => {
  if (!files || files.length === 0) return;

  const zip = new JSZip();
  const isTS = language === 'typescript';
  const ext = isTS ? 'ts' : 'js';

  files.forEach((file, index) => {
    let canvasObjects = [];
    let width = file.width || file.canvasWidth || 800;
    let height = file.height || file.canvasHeight || 450;
    let bgConfig = file.bgConfig;

    if (file.canvasState) {
      try {
        const state = typeof file.canvasState === 'string' ? JSON.parse(file.canvasState) : file.canvasState;
        canvasObjects = state.objects || [];
        if (state.canvasWidth) width = state.canvasWidth;
        if (state.canvasHeight) height = state.canvasHeight;
      } catch (e) {
        console.error('Failed to parse canvas state for file', file.name);
      }
    }

    // Generate TS/JS Code for this canvas
    const generatedCode = generateNodeCanvasCode({
      language,
      canvasWidth: width,
      canvasHeight: height,
      bgConfig,
      canvasObjects
    });

    const safeName = (file.name || `image_${index + 1}`).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    zip.file(`card_${index + 1}_${safeName}.${ext}`, generatedCode);
  });

  // Package.json
  const packageJson = {
    name: "discord-canvas-generator",
    version: "1.0.0",
    description: "Exported Discord Canvas Code with node-canvas",
    main: isTS ? "dist/index.js" : "index.js",
    scripts: isTS ? {
      "build": "tsc",
      "start": "ts-node index.ts"
    } : {
      "start": "node index.js"
    },
    dependencies: {
      "canvas": "^2.11.2"
    },
    devDependencies: isTS ? {
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0",
      "ts-node": "^10.9.2"
    } : {}
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // tsconfig.json if TypeScript
  if (isTS) {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        moduleResolution: "node",
        outDir: "./dist",
        rootDir: "./",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["**/*.ts"]
    };
    zip.file("tsconfig.json", JSON.stringify(tsconfig, null, 2));
  }

  // Sample index file
  const firstSafeName = (files[0].name || 'card').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const sampleUsage = isTS ? `
import * as fs from 'fs';
import { generateDiscordCard } from './card_1_${firstSafeName}';

async function main() {
  console.log('Rendering Discord Canvas Card...');
  
  const buffer = await generateDiscordCard({
    username: 'Alwin',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    status: 'online',
    role: { name: 'Admin Discord', color: '#5865F2' },
    levelProgress: { value: 75, max: 100 }
  });

  fs.writeFileSync('output.png', buffer);
  console.log('✨ Card rendered successfully to output.png !');
}

main().catch(console.error);
`.trim() : `
const fs = require('fs');
const { generateDiscordCard } = require('./card_1_${firstSafeName}.js');

async function main() {
  console.log('Rendering Discord Canvas Card...');
  
  const buffer = await generateDiscordCard({
    username: 'Alwin',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    status: 'online',
    role: { name: 'Admin Discord', color: '#5865F2' },
    levelProgress: { value: 75, max: 100 }
  });

  fs.writeFileSync('output.png', buffer);
  console.log('✨ Card rendered successfully to output.png !');
}

main().catch(console.error);
`.trim();

  zip.file(`index.${ext}`, sampleUsage);

  // Trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `discord_canvas_${language}_project.zip`);
};
