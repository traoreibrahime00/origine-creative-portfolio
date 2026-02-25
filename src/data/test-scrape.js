import https from 'https';
import fs from 'fs';

https.get('https://www.behance.net/gallery/208571167/Logofolio-Vol4', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('dump.html', data);
        console.log("dumped");
    });
});
