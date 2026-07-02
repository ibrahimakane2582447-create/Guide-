import https from 'https';
import fs from 'fs';

const url = 'https://ui-avatars.com/api/?name=Muslim+Guide&background=059669&color=fff&size=512&rounded=true&bold=true';
const file = fs.createWriteStream('./public/icon.png');

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed');
  });
});
