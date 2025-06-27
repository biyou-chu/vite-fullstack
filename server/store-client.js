export function getStore(env, name = 'chulian') {
  const id = env.Store.idFromName(name);
  const stub = env.Store.get(id);

  async function call(method, ...args) {
    console.log('store-client -> call ', method, args)

    const res = await stub.fetch("https://do.internal/rpc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method, args }),
    });

    const data = await res.json();
    console.log('store-client -> call ', data)

    if (!data.ok) {
      throw new Error(`Store method "${method}" failed: ${data.error}`);
    }

    return data.result;
  }

  return {
    querySql: (query, params = []) => call("querySql", query, params),
    executeSql: (query, params = []) => call("executeSql", query, params),
    transaction: (actions) => call("transaction", actions),
    bulkInsert: (table, columns, valuesArray) => call("bulkInsert", table, columns, valuesArray),
    getKv: (key) => call("getKv", key),
    setKv: (key, value) => call("setKv", key, value),
    deleteKv: (key) => call("deleteKv", key),
    listKv: (prefix) => call("listKv", prefix),
    cleanExpiredKv: (prefix, isExpiredFn) => call('cleanExpiredKv', prefix, isExpiredFn),
    applyMigration: (version, sqlContent) => call("applyMigration", version, sqlContent),
    hasMigration: (version) => call("hasMigration", version),
    markMigration: (version) => call("markMigration", version),
  };
}
