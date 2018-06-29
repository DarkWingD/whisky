// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  local:false,
  apiUrl: 'https://dvexsexqapi.azurewebsites.net/api', 
  loggingTag: 'BallparkAppDev',
  clientid:'5bd3caef-bf51-4b50-a3f2-cbc8a0c603ad',
  tenant: 'debfe224-0263-486b-8e8c-4f7614ff049e'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
