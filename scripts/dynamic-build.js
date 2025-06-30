const { execSync } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';
const buildId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const hostname = os.hostname();
const interfaces = os.networkInterfaces();
const isLocalhost = Object.values(interfaces)
    .flat()
    .some((iface) => iface && iface.address === '127.0.0.1');
const isLocal = hostname.includes('local') || isLocalhost;

try {
    if (isLocal && isWindows) {
        console.log('🐧 Detected Windows env');
        const psCommand = `$buildId = Get-Date -Format yyyyMMddHHmmss; Set-Content -Path .env.local -Value \"NEXT_PUBLIC_BUILD_ID=$buildId\"`;
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
    } else {
        console.log('🐧 Detected Linux/EC2 or non-Windows env');
        const bashCommand = `BUILD_ID=${buildId} && echo "NEXT_PUBLIC_BUILD_ID=$BUILD_ID" > .env.local`;
        execSync(bashCommand, { shell: '/bin/bash', stdio: 'inherit' });
    }

    execSync('next build', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
