import { db } from "./db";

async function test() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ Conectado com sucesso!");
    console.log(result.rows);
  } catch (error) {
    console.error("❌ Erro na conexão:", error);
  } finally {
    process.exit();
  }
}

test();