const fs = require('fs');
const path = require('path');

function listDir(dir) {
  try { return fs.readdirSync(dir); } catch(e) { return `ERROR: ${e.message}`; }
}

module.exports = (req, res) => {
  const taskDir = '/var/task';
  const backendDir = '/var/task/backend';
  const info = {
    __dirname,
    taskDir: listDir(taskDir),
    backendDir: listDir(backendDir),
    backendDist: listDir(path.join(backendDir, 'dist')),
    taskDist: listDir(path.join(taskDir, 'dist')),
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(info, null, 2));
};
