const { createApp } = require('../backend/dist/serverless');

module.exports = async (req, res) => {
  const app = await createApp();
  app(req, res);
};
