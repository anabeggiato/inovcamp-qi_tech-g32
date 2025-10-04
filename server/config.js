module.exports = {
  database: {
    connectionString: 'postgres://qitech_user:6qijhcxCk7GIrU9irnhGTs4nsC9Ol76E@dpg-d3cvvsl6ubrc73f64cpg-a.oregon-postgres.render.com:5432/qitech'
  },
  jwt: {
    secret: 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '24h'
  },
  server: {
    port: 3000,
    env: 'development'
  }
};
