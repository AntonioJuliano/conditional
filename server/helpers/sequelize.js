import Sequelize, { Op } from 'sequelize';
import Logger from './logger';

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}`
  + `@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    logging: false,
    dialect: 'postgres',
    protocol: 'postgres',
    operatorsAliases: Op,
    pool: {
      max: process.env.PG_POOL_MAX,
      min: process.env.PG_POOL_MIN,
      idle: process.env.PG_POOL_IDLE,
      acquire: process.env.PG_POOL_ACQUIRE,
      handleDisconnects: true,
    },
  },
);

async function connect() {
  try {
    await sequelize.authenticate();

    Logger.info({
      at: 'sequelize#connect',
      message: 'Connected to postgres',
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'test') {
      throw e;
    }

    Logger.error({
      at: 'sequelize#connect',
      message: 'Failed to connect to postgres',
      error: e,
    });
    setTimeout(connect, 5000);
  }
}

sequelize.connect = connect;

export default sequelize;
