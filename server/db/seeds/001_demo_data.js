const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  await knex.transaction(async (trx) => {
    await trx.raw(`
      TRUNCATE TABLE matches, ledger, loans, offers, scores, frauds, academic_performance, institutions, users RESTART IDENTITY CASCADE;
    `);

    // Hash da senha padrão "123456"
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Institutions
    await trx("institutions").insert({
      name: "Faculdade Exemplo",
      integration_meta: trx.raw(
        `jsonb_build_object('integration','mock','notes','API B2B mock')`
      ),
    });

    const resInst = await trx.raw(`SELECT create_institution_user(1) AS id`);
    const institutionUserId = resInst.rows[0] ? resInst.rows[0].id : null;

    // Users
    await trx("users").insert([
      {
        name: "Alice Silva",
        cpf: "12345678901",
        email: "alice@test.com",
        role: "student",
        password: hashedPassword,
      },
      {
        name: "Bob Santos",
        cpf: "23456789012",
        email: "bob@test.com",
        role: "investor",
        password: hashedPassword,
      },
      {
        name: "Charlie Souza",
        cpf: "34567890123",
        email: "charlie@test.com",
        role: "student",
        password: hashedPassword,
      },
    ]);

    // Academic performance
    await trx("academic_performance").insert({
      user_id: 1,
      school_id: 1,
      period: "2025-1",
      grade_avg: 8.5,
      attendance_pct: 92,
      status: "active",
    });

    // Frauds
    await trx("frauds").insert({
      user_id: 1,
      type: "OTP_failed",
      severity: 3,
      payload: trx.raw(`'{"attempts":2}'::jsonb`),
    });

    // Forçar recompute (trigger pode ter feito isso mas garantimos)
    await trx.raw(`SELECT recompute_score_for_user(1)`);

    // Offers
    await trx("offers").insert({
      investor_id: 2,
      amount_available: 10000,
      term_months: 12,
      min_rate: 1.5,
    });

    // Loans
    await trx("loans").insert({
      borrower_id: 1,
      school_id: 1,
      amount: 5000,
      term_months: 12,
      status: "pending",
      origination_pct: 0.015,
      marketplace_pct: 0.005,
      custody_pct_monthly: 0.001,
      spread_pct_annual: 0.005,
    });

    // Matching automático
    await trx.raw(`SELECT match_loan(1)`);

    // Cria conta de custódia se necessário e transfere do investidor para custódia
    await trx.raw(`
      DO $$
      DECLARE
        v_custody INT;
        v_investor INT := 2;
        v_amount NUMERIC := 5000;
      BEGIN
        SELECT custody_user_id INTO v_custody FROM loans WHERE id = 1;
        IF v_custody IS NULL THEN
          PERFORM create_custody_for_loan(1);
          SELECT custody_user_id INTO v_custody FROM loans WHERE id = 1;
        END IF;

        PERFORM ledger_transfer(v_investor, v_custody, v_amount, 'loan_funding', 'loan_1_funding', jsonb_build_object('loan_id',1));
      END $$;
    `);

    // Libera para instituição
    await trx.raw(`SELECT release_to_institution(1)`);
  });

  console.log("Demo seed executed successfully!");
  
  // Executar seed da Payment API
  const paymentApiSeed = require('./002_payment_api_data');
  await paymentApiSeed.seed(knex);
};
