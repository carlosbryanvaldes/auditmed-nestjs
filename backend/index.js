try {
  const { createApp } = require('./dist/serverless');
  let cachedApp = null;
  module.exports = async (req, res) => {
    try {
      if (!cachedApp) cachedApp = await createApp();
      cachedApp(req, res);
    } catch (e) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: e.message, stack: e.stack }));
    }
  };
} catch (e) {
  module.exports = (req, res) => {
    res.statusCode = 500;
    res.end(JSON.stringify({ loadError: e.message, stack: e.stack }));
  };
}
