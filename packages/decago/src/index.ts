import { Command } from 'commander';
import * as orm from '@decago/orm/src';
import rpc from './rpc';
import { exec } from 'child_process';

export function main() {
    const program = new Command();

    program
        .name('decago')
        .description('CLI for Decago')
        .version(require('../package.json').version);

    program
        .command('all')
        .description("Run 'orm' and 'rpc'")
        .action(() => {
            orm();
            rpc();
        });

    program
        .command('orm')
        .description('Generate SQL and TS for your database')
        .action(orm);

    program
        .command('rpc')
        .description(
            'Generate TS for your Remote Procedure Call Application Programming Interface'
        )
        .action(rpc);

    program
        .command('dev')
        .description(
            'Starts the application in development mode with hot-code reloading, error reporting'
        )
        .option('-p, --port <port>', 'Port to listen on', parseInt, 3000)
        .action((options) => {
            exec('npx next dev -p ' + options.port);
        });

    program
        .command('build')
        .description(
            'Creates an optimized production build of your application'
        )
        .action(() => {
            exec('npx next build');
        });

    program
        .command('start')
        .description('Starts the application in production mode')
        .option('-p, --port <port>', 'Port to listen on', parseInt, 3000)
        .action((options) => {
            exec('npx next start -p ' + options.port);
        });

    program.parse();
}
