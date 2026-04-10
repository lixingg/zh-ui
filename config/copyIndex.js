// copy-404.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// vue-tsc --noEmit --skipLibCheck && vite build --mode production --config ./config/prod.doc.config.ts && node ./config/copyDocs.js &&
// const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootPath = path.resolve(import.meta.url, '../..');
console.log('import.meta.url',import.meta.url)
console.log('__dirname',rootPath)
const distDir = path.join(rootPath, 'docs')
console.log('distDir',distDir)
const src = path.join(distDir, 'index.html')
console.log('src',src)
const dest = path.join(distDir, '404.html')
console.log('dest',dest)
if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log('✅ 404.html created')
} else {
    console.error('❌ index.html not found, build first?')
}
