const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const baseHref = process.env.BASE_HREF || '/';

if (!args.includes('--base-href') && !args.includes('--baseHref')) {
  args.push('--base-href', baseHref);
}

const result = spawnSync('ng', args, {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status == null ? 1 : result.status);
