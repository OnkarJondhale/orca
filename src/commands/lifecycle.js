import path from 'path'
import chalk from 'chalk'
import { install, deleteSkillCmd, updateSkill, upgradeCLI } from '../core/index.js';
import { parseConfigPair, writeCredential } from '../utils/index.js';

export async function handleInstall(skill, options) {
    if (options.file && options.global) {
        console.error(`${chalk.red('ERROR')} --global and -f cannot be used together`)
        process.exit(1)
    }

    if (!skill && !options.file) {
        console.error(`${chalk.red('ERROR')} A skill name or -f <path> is required`)
        process.exit(1)
    }

    if (!skill && options.file) {
        skill = path.basename(path.resolve(options.file))
    }

    console.log(`Executing install routine for: ${skill}`);
    await install(skill, options);
}

export function handleConfigWrite(raw) {
    const [key, value] = parseConfigPair(raw);
    writeCredential(key, value);
}

export function handleDelete(skill, options) {
    if (options.file && options.global) {
        console.error(`${chalk.red('ERROR')} --global and -f cannot be used together`)
        process.exit(1)
    }

    if (!skill && !options.file) {
        console.error(`${chalk.red('ERROR')} A skill name or -f <path> is required`)
        process.exit(1)
    }

    deleteSkillCmd(skill, options);
}

export function handleUpdate(skill, options) {
    if (options.file && options.global) {
        console.error(`${chalk.red('ERROR')} --global and -f cannot be used together`)
        process.exit(1)
    }

    if (!skill && !options.file) {
        console.log(`Executing update event target: Orca Self`);
        return
    }

    updateSkill(skill, options);
}

export function handleUpgrade(version) {
    upgradeCLI(version)
}
