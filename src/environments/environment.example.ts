// Copia este archivo como `environment.ts` (dev) y `environment.prod.ts` (prod).
// Ninguno de los dos se versiona (ver .gitignore) — pide los valores reales
// al equipo/backend, nunca los commitees.
//
// `ng build` reemplaza environment.ts por environment.prod.ts según
// `fileReplacements` en angular.json.

export const environment = {
  production: false,
  version: 9,
  maps: {
    apikey: 'REEMPLAZAR_CON_GOOGLE_MAPS_API_KEY'
  },
  aldia: {
    uri: 'https://api.aldialogistica.com/api/',
    client_id: 'REEMPLAZAR_CON_CLIENT_ID',
    client_secret: 'REEMPLAZAR_CON_CLIENT_SECRET',
    authUser: 'REEMPLAZAR_CON_AUTH_USER',
    authPassword: 'REEMPLAZAR_CON_AUTH_PASSWORD'
  }
};
