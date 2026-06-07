// ─────────────────────────────────────────────────────
// @orca/commands/lifecycle - Action handlers for skill states
// ─────────────────────────────────────────────────────

const { install } = require('../core/install');

function handleInstall(skill, options) {
    // Future work: engine.download() and engine.deploy()
    console.log(`Executing install routine for: ${skill}`);
    install(skill,options);
}

function handleDelete(skill) {
    console.log(`Executing deletion for local skill: ${skill}`);
}

function handleUpdate(skill) {
    console.log(`Executing update event target: ${skill || 'Orca Self'}`);
}

function handleUpgrade() {
    console.log(`Upgrading all installed workspace and system skills...`);
}

module.exports = {
    handleInstall,
    handleDelete,
    handleUpdate,
    handleUpgrade,
};