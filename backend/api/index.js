module.exports = async (req, res) => {
  const { createApp } = require('../dist/serverless');
  const app = await createApp();
  app(req, res);
};
