const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: '109.203.109.67',
      user: 'adster.app_o52i81reut8',
      password: 'q65cFaMX$1',
      secure: false
    });
    console.log('Connected to FTP');

    const distDir = path.join(__dirname, 'dist');
    const serverDistDir = path.join(__dirname, 'server', 'dist');

    // Upload frontend
    console.log('Uploading frontend...');
    await client.ensureDir('/httpdocs');
    await client.uploadFrom(path.join(distDir, 'index.html'), '/httpdocs/index.html');
    console.log('  index.html');

    // Upload favicon if exists
    const faviconPath = path.join(distDir, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      await client.uploadFrom(faviconPath, '/httpdocs/favicon.svg');
      console.log('  favicon.svg');
    }

    // Upload PHP endpoints
    const phpFile = path.join(__dirname, 'supporters.php');
    if (fs.existsSync(phpFile)) {
      await client.uploadFrom(phpFile, '/httpdocs/supporters.php');
      console.log('  supporters.php');
    }

    const assetsDir = path.join(distDir, 'assets');
    const assets = fs.readdirSync(assetsDir);
    await client.ensureDir('/httpdocs/assets');
    for (const file of assets) {
      await client.uploadFrom(path.join(assetsDir, file), '/httpdocs/assets/' + file);
      console.log('  assets/' + file);
    }

    // Upload server dist
    console.log('Uploading server...');
    await client.ensureDir('/httpdocs/server/dist/routes');

    const routesDir = path.join(serverDistDir, 'routes');
    for (const file of fs.readdirSync(routesDir)) {
      await client.uploadFrom(path.join(routesDir, file), '/httpdocs/server/dist/routes/' + file);
      console.log('  server/dist/routes/' + file);
    }

    const serverFiles = fs.readdirSync(serverDistDir).filter(f => f.endsWith('.js'));
    for (const file of serverFiles) {
      await client.uploadFrom(path.join(serverDistDir, file), '/httpdocs/server/dist/' + file);
      console.log('  server/dist/' + file);
    }

    console.log('\nDeploy complete!');
  } catch (e) {
    console.error('Deploy error:', e.message);
  } finally {
    client.close();
  }
}

deploy();
