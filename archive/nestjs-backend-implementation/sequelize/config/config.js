module.exports = {
  default: {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    schema: 'public',
    dialect: process.env.DATABASE_DIALECT,
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta_' + process.env.DATABASE_SCHEMA,
  },
};
