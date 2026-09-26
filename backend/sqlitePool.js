const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const dbFile = path.join(__dirname, "data", "trekigo.sqlite");
const schemaFile = path.join(__dirname, "schema.sqlite.sql");

let db;
let ready;

function mysqlToSqlite(sql) {
  return sql
    .replace(/FOR UPDATE/gi, "")
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m-%d'\s*\)/gi, "date($1)")
    .replace(/JSON_ARRAYAGG\(\s*([\s\S]*?)\s+ORDER BY[\s\S]*?\)/gi, "json_group_array($1)")
    .replace(/JSON_ARRAYAGG\(/gi, "json_group_array(")
    .replace(/JSON_OBJECT\(/gi, "json_object(")
    .replace(/JSON_ARRAY\(\)/gi, "json_array()")
    .replace(/\bIFNULL\(/gi, "IFNULL(")
    .replace(/\bDATE\(([^)]+)\)/gi, "date($1)")
    .replace(/\s+AFTER\s+[`"]?\w+[`"]?/gi, "")
    .replace(/DECIMAL\(\d+,\d+\)/gi, "REAL")
    .replace(/VARCHAR\(\d+\)/gi, "TEXT")
    .replace(/TINYINT\(\d+\)/gi, "INTEGER")
    .replace(/\bTRUE\b/gi, "1")
    .replace(/\bFALSE\b/gi, "0")
    .replace(/`/g, "");
}

function persist() {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbFile, Buffer.from(db.export()));
}

function addColumnIfMissing(table, column, definition) {
  const info = db.exec(`PRAGMA table_info(${table})`);
  const names = (info[0]?.values || []).map((row) => row[1]);
  if (!names.includes(column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateSchema() {
  addColumnIfMissing("accommodation_images", "isDeleted", "INTEGER DEFAULT 0");
  addColumnIfMissing("coupons", "createdAt", "TEXT DEFAULT CURRENT_TIMESTAMP");
  addColumnIfMissing("hero_section", "createdAt", "TEXT DEFAULT CURRENT_TIMESTAMP");
  addColumnIfMissing("offers_promotional_banners", "createdAt", "TEXT DEFAULT CURRENT_TIMESTAMP");
  addColumnIfMissing("accommodations", "displayOrder", "INTEGER DEFAULT 0");
  persist();
}

function runStatement(sql, params = []) {
  const converted = mysqlToSqlite(sql).trim();
  const isSelect = /^\s*(SELECT|PRAGMA|WITH)\b/i.test(converted);
  const statement = db.prepare(converted);
  if (params && params.length) statement.bind(params);

  if (isSelect) {
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    statement.free();
    return [rows, []];
  }

  statement.step();
  const insertId = Number(
    db.exec("SELECT last_insert_rowid() AS id")[0]?.values?.[0]?.[0] || 0,
  );
  const changed = db.getRowsModified();
  statement.free();
  persist();
  return [
    {
      insertId,
      affectedRows: changed,
      changedRows: changed,
    },
    [],
  ];
}

async function init() {
  if (ready) return ready;
  ready = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => path.join(__dirname, "node_modules", "sql.js", "dist", file),
    });
    if (fs.existsSync(dbFile)) {
      db = new SQL.Database(fs.readFileSync(dbFile));
    } else {
      db = new SQL.Database();
      db.exec(fs.readFileSync(schemaFile, "utf8"));
      persist();
    }
    migrateSchema();
    return db;
  })();
  return ready;
}

function createConnection() {
  return {
    async execute(sql, params = []) {
      await init();
      return runStatement(sql, params);
    },
    async query(sql, params = []) {
      await init();
      return runStatement(sql, params);
    },
    async beginTransaction() {},
    async commit() {
      persist();
    },
    async rollback() {},
    release() {},
  };
}

const pool = {
  async execute(sql, params = []) {
    await init();
    try {
      return runStatement(sql, params);
    } catch (error) {
      if (/duplicate column/i.test(error.message)) {
        error.code = "ER_DUP_FIELDNAME";
      }
      if (/UNIQUE constraint failed/i.test(error.message)) {
        error.code = "ER_DUP_ENTRY";
      }
      throw error;
    }
  },
  async query(sql, params = []) {
    return pool.execute(sql, params);
  },
  async getConnection() {
    await init();
    return createConnection();
  },
  async end() {
    persist();
  },
  on() {},
};

module.exports = pool;
