#!/usr/bin/env node

const program = require('commander')
const commands = require('./commands')

let commandSet = false

program
  .version('0.0.1')

program
  .command('fetch [register]')
  .description("start tracking a register and delete its data")
  .action(async function (register, cmd) {
    console.log('hello')
    if(register === undefined) {
        const code = await commands.fetchAll()
        process.exit(code)
    } else {
        console.log('fetching one')
        commands.fetchRegister(register);
        console.log('Use "register-sync rm ' + register + '" to stop tracking this register and delete its data.')
    }
    commandSet = true 
  })

program
  .command('remove <register>')
  .description("stop tracking a register and delete its data")
  .action(function (register, cmd) {
    commands.rm(register)
    commandSet = true
  })

program
  .command('status')
  .description("display versions of local data files and check for updates")
  .action(function (cmd) {
    commands.status()
    commandSet = true
    // if there are new versions, suggest updating
  })

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

program.parse(process.argv)

/*
if(!commandSet) {
    program.help()
}*/