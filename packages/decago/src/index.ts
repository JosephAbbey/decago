import { Command } from 'commander';
import { orm } from '@decago/orm';
import { exec } from 'child_process';

function run(command: string) {
    return new Promise<void>((resolve, reject) => {
        const child = exec(command);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (data) => console.log(data));
        child.stderr.on('data', (data) => console.log(data));
        child.on('error', (error) => reject(error));
        child.on('close', (exitCode) => {
            console.log('Exit code:', exitCode);
            resolve(undefined);
        });
    });
}

export function main() {
    const program = new Command();

    program
        .name('decago')
        .description('CLI for Decago')
        .version(require('../package.json').version);

    program
        .command('orm')
        .description('Generate SQL and TS for your database')
        .action(orm);

    program
        .command('dev')
        .description(
            'Starts the application in development mode with hot-code reloading, error reporting'
        )
        .option('-p, --port <port>', 'Port to listen on', parseInt, 3000)
        .action((options) => run('npx next dev -p ' + options.port));

    program
        .command('build')
        .description(
            'Creates an optimized production build of your application'
        )
        .action(() => run('npx next build'));

    program
        .command('start')
        .description('Starts the application in production mode')
        .option('-p, --port <port>', 'Port to listen on', parseInt, 3000)
        .action((options) => run('npx next start -p ' + options.port));

    program.parse();
}
