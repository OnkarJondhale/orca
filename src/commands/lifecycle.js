// ─────────────────────────────────────────────────────
// @orca/commands/lifecycle - Action handlers for skill states
// ─────────────────────────────────────────────────────

import { install } from '../core/install.js';

export function handleInstall(skill, options) {
    // Future work: engine.download() and engine.deploy()
    console.log(`Executing install routine for: ${skill}`);
    install(skill,options);
}

export function handleDelete(skill) {
    console.log(`Executing deletion for local skill: ${skill}`);
}

export function handleUpdate(skill) {
    console.log(`Executing update event target: ${skill || 'Orca Self'}`);
}

export function handleUpgrade() {
    console.log(`Upgrading all installed workspace and system skills...`);
}