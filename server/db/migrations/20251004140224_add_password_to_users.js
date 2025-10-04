exports.up = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.text('password').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('password');
  });
};