module.exports = async (req, res) => {
  const { createApp } = require('../backend/dist/serverless');
  const app = await createApp();
  app(req, res);
};
