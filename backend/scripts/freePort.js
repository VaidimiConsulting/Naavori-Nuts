import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;

try {
  if (process.platform === 'win32') {
    const output = execSync(`netstat -ano | findstr :${PORT}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const lines = output.split('\n').filter(l => l.includes('LISTENING'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[PortGuard] Released stale process ${pid} on port ${PORT}`);
        } catch (e) {
          // ignore
        }
      }
    }
  }
} catch (e) {
  // Port was free, all good
}
