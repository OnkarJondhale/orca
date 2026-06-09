#!/usr/bin/env node

// ─────────────────────────────────────────────────────
// @orca/bin - Global CLI entry point & Routing Layer
// ─────────────────────────────────────────────────────

import { Command } from 'commander';
import { 
    CLI_NAME, 
    CLI_DESCRIPTION, 
    CLI_VERSION, 
    OPTIONS, 
    COMMANDS 
} from '../utils/const.js';

import * as lifecycle from '../commands/lifecycle.js';
import * as query from '../commands/query.js';
import * as config from '../commands/config.js';

const program = new Command();

// Config meta info strings
program
    .name(CLI_NAME)
    .description(CLI_DESCRIPTION)
    .version(CLI_VERSION, '--version', 'Show utility version');

// Handle --config manually before commander parsing
const configIndex = process.argv.findIndex(a => a === '--config' || a === '-c')
if (configIndex !== -1 && configIndex + 1 < process.argv.length) {
    const value = process.argv[configIndex + 1]
    if (!value.startsWith('-')) {
        lifecycle.handleConfigWrite(value)
        process.exit(0)
    }
}

// Set up global flag capabilities
program
    .option(OPTIONS.VERBOSE.flags, OPTIONS.VERBOSE.description);

// Overriding default help command string description flag target
program
    .helpOption(OPTIONS.HELP.flags, OPTIONS.HELP.description);

// Custom layout grouping print block helper output for --help requests
program.addHelpText('after', `
Classification Overview:
  Core Lifecycle          install, delete, update, upgrade
  Listing & Info          list, describe, info, search
  Creation                create, publish, delete-remote
  Authentication          login, logout
  Security                verify
  Diagnostics             doctor
`);

// 1. CORE LIFECYCLE SUB-COMMANDS
program
    .command(COMMANDS.INSTALL.name)
    .description(COMMANDS.INSTALL.description)
    .argument(COMMANDS.INSTALL.arg, COMMANDS.INSTALL.argDescription)
    .option(OPTIONS.REGISTRY.flags, 'GitHub user/org base URL (defaults to https://github.com/OnkarJondhale)')
    .option(OPTIONS.GLOBAL.flags, OPTIONS.GLOBAL.description)
    .option(OPTIONS.CLAUDE.flags, OPTIONS.CLAUDE.description)
    .option(OPTIONS.COPILOT.flags, OPTIONS.COPILOT.description)
    .option(OPTIONS.KIRO.flags, OPTIONS.KIRO.description)
    .option(OPTIONS.TOKEN.flags, OPTIONS.TOKEN.description)
    .action(lifecycle.handleInstall);

program
    .command(COMMANDS.DELETE.name)
    .description(COMMANDS.DELETE.description)
    .argument(COMMANDS.DELETE.arg, COMMANDS.DELETE.argDescription)
    .action(lifecycle.handleDelete);

program
    .command(COMMANDS.UPDATE.name)
    .description(COMMANDS.UPDATE.description)
    .argument(COMMANDS.UPDATE.arg, COMMANDS.UPDATE.argDescription)
    .action(lifecycle.handleUpdate);

program
    .command(COMMANDS.UPGRADE.name)
    .description(COMMANDS.UPGRADE.description)
    .action(lifecycle.handleUpgrade);

// 2. LISTING & INFORMATION ACTIONS
program
    .command(COMMANDS.LIST.name)
    .description(COMMANDS.LIST.description)
    .argument(COMMANDS.LIST.arg, COMMANDS.LIST.argDescription)
    .action(query.handleList);

program
    .command(COMMANDS.DESCRIBE.name)
    .description(COMMANDS.DESCRIBE.description)
    .argument(COMMANDS.DESCRIBE.arg, COMMANDS.DESCRIBE.argDescription)
    .action(query.handleDescribe);

program
    .command(COMMANDS.INFO.name)
    .description(COMMANDS.INFO.description)
    .argument(COMMANDS.INFO.arg, COMMANDS.INFO.argDescription)
    .action(query.handleInfo);

program
    .command(COMMANDS.SEARCH.name)
    .description(COMMANDS.SEARCH.description)
    .argument(COMMANDS.SEARCH.arg, COMMANDS.SEARCH.argDescription)
    .action(query.handleSearch);

// 3. DEVELOPMENT PLATFORM INTERFACES (CREATION & DEPLOYMENT)
program
    .command(COMMANDS.CREATE.name)
    .description(COMMANDS.CREATE.description)
    .option('-f, --file <path>', 'create blueprint directly utilizing a JSON configuration target path')
    .action((options) => {
        console.log(`Spawning interactive scaffolding schema engine...`);
    });

program
    .command(COMMANDS.PUBLISH.name)
    .description(COMMANDS.PUBLISH.description)
    .argument(COMMANDS.PUBLISH.arg, COMMANDS.PUBLISH.argDescription)
    .action((skillWithVersion) => {
        console.log(`Preparing package serialization pipeline for: ${skillWithVersion}`);
    });

program
    .command(COMMANDS.DELETE_REMOTE.name)
    .description(COMMANDS.DELETE_REMOTE.description)
    .argument(COMMANDS.DELETE_REMOTE.arg, COMMANDS.DELETE_REMOTE.argDescription)
    .action((skillWithVersion) => {
        console.log(`Requesting deployment registry tracking record drop for: ${skillWithVersion}`);
    });

// 4. ACCESS CONTROL AND PROFILES
program
    .command(COMMANDS.LOGIN.name)
    .description(COMMANDS.LOGIN.description)
    .action(() => {
        console.log(`Opening secure handshake routine pipeline profile connection context...`);
    });

program
    .command(COMMANDS.LOGOUT.name)
    .description(COMMANDS.LOGOUT.description)
    .action(() => {
        console.log(`Flushing remote registry active authorization reference caches.`);
    });

// 5. HARDWARE SYSTEM OPERATIONS AND INTEGRITY SANE TRACKS
program
    .command(COMMANDS.VERIFY.name)
    .description(COMMANDS.VERIFY.description)
    .argument(COMMANDS.VERIFY.arg, COMMANDS.VERIFY.argDescription)
    .action((skill) => {
        console.log(`Running deep validation loop routine checks matching signatures against skill: ${skill}`);
    });

// 6. ADVANCED INNER LOGIC SETTINGS ACTIONS
program
    .command(COMMANDS.DOCTOR.name)
    .description(COMMANDS.DOCTOR.description)
    .action(config.handleDoctor);

// Parse commands out from application invocation input
program.parse(process.argv);