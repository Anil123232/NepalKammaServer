const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Successfully connected to the server.');
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));