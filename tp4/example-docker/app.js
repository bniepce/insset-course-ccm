const express = require('express');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();

app.get('/', (req, res) => {
  res.json({'message': 'Hello World'});
});

app.listen(PORT, HOST);

console.log(`App Running on http://${HOST}:${PORT}`);