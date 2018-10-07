import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import RequestLogger from './middlewares/request-logger';

export default function (index) {
  const app = express();

  const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use((req, res, next) => next());

  app.use(bodyParser.json());

  app.use(RequestLogger);

  if (index) {
    app.use('/v1', index);
  }

  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      errorCode: 404,
    });
  });

  return app;
}
