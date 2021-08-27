const fs = require('fs')

const sha = process.env.ELECTRON_WEBPACK_APP_SHA
const content = `
export const version = "${sha}"
`;

fs.writeFileSync('./src/version.ts', content);