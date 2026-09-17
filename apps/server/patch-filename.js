import fs from 'fs';
const filepath = './src/services/media.service.ts';
let code = fs.readFileSync(filepath, 'utf8');

const target = /public_id: \$\{Date\.now\(\)\}-\$\{Math\.round\(Math\.random\(\) \* 1e9\)\}\$\{path\.extname\(file\.originalname\)\}/g;

code = code.replace(target, 'use_filename: true,\n        unique_filename: true,\n        filename_override: file.originalname');

fs.writeFileSync(filepath, code);
