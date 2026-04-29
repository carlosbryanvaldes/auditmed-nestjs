// Asegura que Prisma resuelva su client desde backend/node_modules
process.env.PRISMA_QUERY_ENGINE_LIBRARY = require('path').join(
  __dirname,
  '..',
  'backend',
  'node_modules',
  '.prisma',
  'client',
  'libquery_engine-rhel-openssl-3.0.x.so.node',
);

const { createApp } = require('../backend/dist/serverless');

module.exports = async (req, res) => {
  const app = await createApp();
  app(req, res);
};
