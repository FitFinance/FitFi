import app from './app.js';

const PORT: number = Number(process.env?.PORT) || 3000;

app.listen(PORT, () => {
  console.log('App is listening on http://localhost:3000');
});
