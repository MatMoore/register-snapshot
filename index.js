#!/usr/bin/env node

const program = require('commander')
const commands = require('./commands')

const handleError = (err) => {
  console.log(err)
  process.exit(1)
}

program
  .version('0.0.1')

program
  .command('fetch')
  .description("If a register URL is given, download its records. Otherwise, download the latest records for all tracked registers.")
  .action((cmd) => {
    commands.fetchAll().catch(handleError).then((code) => process.exit(code))
  })

program
  .command('add <url>')
  .description("If a register URL is given, download its records. Otherwise, download the latest records for all tracked registers.")
  .option('--status [status]', 'records to include: current (default), archived, pending, or all', 'current')
  .action((url, cmd) => {
    commands.fetchRegister(url, cmd.status).catch(handleError)
  })

program
  .command('remove <name>')
  .description("Stop tracking the register with the given name and delete its data")
  .action((register, cmd) => {
    commands.rm(register).catch(handleError)
  })

program
  .command('status')
  .description("Check whether local data is up to date")
  .action((cmd) => {
    commands.status().catch(handleError).then((code) => process.exit(code))
  })

program.on('command:*', function () {
    console.error('Invalid command: %s', program.args.join(' '));
    program.outputHelp()
    process.exit(1);
});

program.parse(process.argv)

if(program.args.length === 0) {
  program.outputHelp()
  process.exit(1);
}