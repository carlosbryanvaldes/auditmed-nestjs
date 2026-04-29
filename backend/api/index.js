const { createApp } = require('../dist/serverless');

module.exports = async (req, res) => {
  const app = await createApp();
  app(req, res);
};
