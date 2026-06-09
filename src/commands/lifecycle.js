import { install } from '../core/install.js';
import { deleteSkillCmd } from '../core/delete.js';
import { parseConfigPair, writeCredential } from '../utils/config.js';

export async function handleInstall(skill, options) {
    console.log(`Executing install routine for: ${skill}`);
    await install(skill, options);
}

export function handleConfigWrite(raw) {
    const [key, value] = parseConfigPair(raw);
    writeCredential(key, value);
}

export function handleDelete(skill, options) {
    deleteSkillCmd(skill, options);
}

export function handleUpdate(skill) {
    console.log(`Executing update event target: ${skill || 'Orca Self'}`);
}

export function handleUpgrade() {
    console.log(`Upgrading all installed workspace and system skills...`);
}
