import hana from '@sap/hana-client';

export async function query(sql, params = []) {
  const connection = hana.createConnection();
  const options = {
    serverNode: `${process.env.HANA_HOST}:${process.env.HANA_PORT || 30015}`,
    uid: process.env.HANA_USER,
    pwd: process.env.HANA_PASSWORD,
    encrypt: process.env.HANA_ENCRYPT !== 'false',
    sslValidateCertificate: process.env.HANA_VALIDATE_CERTIFICATE !== 'false',
    connectionTimeout: 15
  };
  if (!process.env.HANA_HOST || !options.uid || !options.pwd) {
    throw new Error('Configurar HANA_HOST, HANA_USER y HANA_PASSWORD en .env');
  }
  try {
    await new Promise((resolve, reject) => connection.connect(options, err => err ? reject(err) : resolve()));
    return await new Promise((resolve, reject) => connection.exec(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
  } finally {
    try { connection.disconnect(); } catch { /* cierre de conexión fallida */ }
  }
}
