import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'src', 'resources');
const dst = path.join(here, 'dist', 'resources');

function copyDir(from, to) {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const s = path.join(from, entry.name);
        const t = path.join(to, entry.name);
        if (entry.isDirectory()) {
            copyDir(s, t);
        } else {
            fs.copyFileSync(s, t);
        }
    }
}

copyDir(src, dst);
console.log(`Copied resources: ${src} -> ${dst}`);
