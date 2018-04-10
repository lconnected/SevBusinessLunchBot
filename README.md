# SevBusinessLunchBot
Telegram bot provides info about business lunches at the Sevastopol's city center.

## Development
To run app with live reload use
- `npm i`
- `npm run dev`

## Production
Strongly recommended make instant build to run app on production using `pm2` Node.js process manager
Make sure `gulp` and `pm2` packages are installed globally.
  - `npm i -g gulp pm2`
  
Then install all the required packages with `npm i`  
  
Use `npm run build` or `gulp build` to build this app from es6 based sources to instant es5 - compitable application.
Use `npm run prod` to run application via `pm2`.
