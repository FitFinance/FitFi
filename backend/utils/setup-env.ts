import dotenv from 'dotenv';

(() => {
  dotenv.config({
    path: ['./.env', './secret.env'],
  });
})();
