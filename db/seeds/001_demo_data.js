// db/seeds/001_demo_data.js
const fs = require("fs");

exports.seed = async function (knex) {
  // Em transação para segurança
  await knex.transaction(async (trx) => {
    // Truncate respeitando FK (RESTART IDENTITY CASCADE)
    await trx.raw(`
      TRUNCATE TABLE matches, ledger, loans, offers, scores, frauds, academic_performance, institutions, users RESTART IDENTITY CASCADE;
    `);

    // Institutions
    await trx("institutions").insert({
      name: "Faculdade Exemplo",
      integration_meta: trx.raw(
        `jsonb_build_object('integration','mock','notes','API B2B mock')`
      ),
    });

    // cria institution-user sistêmico (retorno via rows[0].id)
    const resInst = await trx.raw(`SELECT create_institution_user(1) AS id`);
    const institutionUserId =
      resInst.rows && resInst.rows[0] ? resInst.rows[0].id : null;

    // Usuários
    await trx("users").insert([
      {
        nome: "Alice Silva",
        cpf: "12345678901",
        email: "alice@mail.com",
        role: "student",
      },
      {
        nome: "Bruno Souza",
        cpf: "23456789012",
        email: "bruno@mail.com",
        role: "investor",
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
    });

    // Matching automático
    await trx.raw(`SELECT match_loan(1)`);

    // Cria conta de custódia se necessário e transfere do investidor para custódia
    await trx.raw(`
      DO $$
      DECLARE v_custody INT; v_investor INT := 2; v_amount NUMERIC := 5000;
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
};
