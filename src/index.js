const app = require('./app');

const PORT = 2000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});