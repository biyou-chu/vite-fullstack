// import Store from '../store.js'; // 在 esbuild 打包 bundle.js 的时候已经导入了 Store
import migrations from './migrations.js';
import worker from './main.js';

// 注入迁移信息到 Store 类
Store.__MIGRATIONS__ = migrations;

// ====== 数据库初始化逻辑 ======
let initializationLock = null;

/**
 * 初始化数据库（应用启动时自动执行）
 */
async function initializeDatabase(env) {
  if (initializationLock) return initializationLock;
  
  initializationLock = (async () => {
    try {
      console.log('[DB] 🔁 Starting database initialization...');
      
      // 使用全局 Store 实例
      const storeId = env.Store.idFromName('chulian');
      const store = env.Store.get(storeId);
      
      // 通过 RPC 执行迁移
      const response = await store.fetch('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'applyMigrations',
          args: [Store.__MIGRATIONS__]
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(`Database migration failed: ${result.error}`);
      }
      
      console.log('[DB] ✅ Database initialized successfully');
      return result;
    } catch (error) {
      console.error('[DB] ❌ Initialization error:', error);
      throw error;
    }
  })();
  
  return initializationLock;
}

// 包装原 worker 的 fetch 方法
export default {
  async fetch(request, env, ctx) {
    // 确保数据库初始化完成
    try {
      await initializeDatabase(env);
    } catch (error) {
      return new Response('Database initialization failed', { status: 500 });
    }
    
    // 调用原始 worker 处理逻辑
    return worker.fetch(request, env, ctx);
  }
};