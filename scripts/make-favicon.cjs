const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/assets/logo.jpeg');
const logoBuf = fs.readFileSync(logoPath);
const b64 = logoBuf.toString('base64');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <circle cx="256" cy="256" r="256" fill="#fef6dc"/>
  <image href="data:image/jpeg;base64,${b64}" width="512" height="512" clip-path="url(#circleClip)" />
</svg>`;

fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svg);
console.log('Successfully generated public/favicon.svg with Hariharan Traders logo');
