import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 生成数据库迁移模块
 */
function generateMigrationsModule() {
  const MIGRATIONS_DIR = path.join(__dirname, '.db/migrations');
  const OUTPUT_FILE = path.join(__dirname, 'server', 'migrations.js');

  try {
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort() // 按文件名排序确保顺序执行
      .map(file => {
        return {
          name: path.basename(file, '.sql'),
          sql: fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
        };
      });

    const jsContent = `/**
 * Build by Chu, an expert AI assistant and exceptional senior software developer
 * with vast knowledge across multiple programming languages, frameworks, and best practices.
 * Created by Biyou.
 * Built at: ${new Date().toISOString()}
 */
export default ${JSON.stringify(migrationFiles, null, 2)};`;

    fs.writeFileSync(OUTPUT_FILE, jsContent);
    console.log(`✅ Generated migrations module with ${migrationFiles.length} migrations`);
    
    return migrationFiles;
  } catch (error) {
    console.error('❌ Failed to generate migrations module:', error);
    process.exit(1);
  }
}

// 主构建函数
async function runBuild() {
  try {
    // 1. 首先生成数据库迁移模块
    generateMigrationsModule();
    
    // 2. 执行 ESBuild 打包
    await build({
      entryPoints: ['server/wrapper.js'], // 使用包装器作为入口
      bundle: true,
      format: 'esm',
      platform: 'neutral',
      target: ['es2020'],
      outfile: 'bundle.js',
      external: [],
      treeShaking: true,
      minify: false,
      sourcemap: false,
      logLevel: 'info',
      banner: {
        js: `
/**
 * Build by Chu, an expert AI assistant and exceptional senior software developer
 * with vast knowledge across multiple programming languages, frameworks, and best practices.
 * Created by Biyou.
 * Built at: ${new Date().toISOString()}
 */
import Store from "./store.js";
`
      },
      footer: {
        js: `export { Store };`
      }
    });
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// 执行构建
runBuild();