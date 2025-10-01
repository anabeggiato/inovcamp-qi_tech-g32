// test-db.js
require("dotenv").config();
const knex = require("knex");
const config = require("./knexfile");

async function testDatabase() {
  const db = knex(config.development);
  
  try {
    console.log("🧪 Testando banco de dados...\n");
    
    // 1. Testar tabelas
    console.log("📋 Verificando tabelas:");
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("✅ Tabelas encontradas:", tables.rows.map(r => r.table_name).join(", "));
    
    // 2. Testar views
    console.log("\n👁️ Verificando views:");
    const views = await db.raw(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public';
    `);
    console.log("✅ Views encontradas:", views.rows.map(r => r.viewname).join(", "));
    
    // 3. Testar funções
    console.log("\n⚙️ Verificando funções:");
    const functions = await db.raw(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);
    console.log("✅ Funções encontradas:", functions.rows.map(r => r.routine_name).join(", "));
    
    // 4. Testar dados
    console.log("\n📊 Verificando dados:");
    const users = await db("users").count("* as count");
    const loans = await db("loans").count("* as count");
    const offers = await db("offers").count("* as count");
    const matches = await db("matches").count("* as count");
    const ledger = await db("ledger").count("* as count");
    
    console.log(`👥 Usuários: ${users[0].count}`);
    console.log(`💰 Empréstimos: ${loans[0].count}`);
    console.log(`📈 Ofertas: ${offers[0].count}`);
    console.log(`🤝 Matches: ${matches[0].count}`);
    console.log(`📝 Ledger: ${ledger[0].count}`);
    
    // 5. Testar view balances
    console.log("\n💳 Testando view balances:");
    const balances = await db.raw("SELECT * FROM balances ORDER BY user_id");
    console.log("✅ Balances:", balances.rows);
    
    // 6. Testar view revenue_by_loan
    console.log("\n💵 Testando view revenue_by_loan:");
    const revenue = await db.raw("SELECT * FROM revenue_by_loan");
    console.log("✅ Revenue:", revenue.rows);
    
    // 7. Testar funções específicas
    console.log("\n🔧 Testando funções:");
    
    // Testar recompute_score_for_user
    await db.raw("SELECT recompute_score_for_user(1)");
    console.log("✅ recompute_score_for_user funcionando");
    
    // Testar ensure_platform_user
    const platformUser = await db.raw("SELECT ensure_platform_user()");
    console.log("✅ ensure_platform_user funcionando, ID:", platformUser.rows[0].ensure_platform_user);
    
    console.log("\n🎉 Todos os testes passaram! Banco de dados está funcionando corretamente.");
    
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await db.destroy();
  }
}

testDatabase();