// ─────────────────────────────────────────────────────
// @orca/utils - Defines constants & metadata definitions
// ─────────────────────────────────────────────────────

const CLI_NAME = "orca";
const CLI_DESCRIPTION = "SKILL manager for agentic workflows";
const CLI_VERSION = "1.0.0";

const OPTIONS = {
    VERBOSE: {
        flags: '-v, --verbose',
        description: 'enable verbose logging'
    },
    CONFIG: {
        flags: '-c, --config <path>',
        description: 'path to configuration file'
    },
    TYPE: {
        flags: '-t, --type <type>',
        description: 'type of skill (e.g., tool, model)',
        default: 'tool'
    },
    REGISTRY: {
        flags: '--registry <name>',
        description: 'specify target registry source'
    },
    GLOBAL: {
        flags: '-g, --global',
        description: 'install target globally across all active IDE environments'
    },
    HELP: {
        flags: '-h, --help',
        description: 'Show help and usage information'
    }
};

const COMMANDS = {
    // Core Lifecycle
    INSTALL: {
        name: 'install',
        description: 'Install a skill from registry, git repo, or local path',
        arg: '<skill>',
        argDescription: 'name of the skill, git repository URL, or local filepath'
    },
    DELETE: {
        name: 'delete',
        description: 'Delete a skill from local storage',
        arg: '<skill>',
        argDescription: 'the name of the local skill to remove'
    },
    UPDATE: {
        name: 'update',
        description: 'Update a specific skill to latest version',
        arg: '[skill]',
        argDescription: 'the specific skill to update (leave empty to update the orca engine itself)'
    },
    UPGRADE: {
        name: 'upgrade',
        description: 'Update all installed skills at once'
    },

    // Listing & Info
    LIST: {
        name: 'list',
        description: 'List all skills installed locally',
        arg: '[target]',
        argDescription: 'specify "remote" to fetch available marketplace instances instead'
    },
    DESCRIBE: {
        name: 'describe',
        description: 'Show detailed structure and setup information about a skill',
        arg: '<skill>',
        argDescription: 'the target skill name'
    },
    INFO: {
        name: 'info',
        description: 'Extended metadata (dependencies, author, license, etc.)',
        arg: '<skill>',
        argDescription: 'the target skill name'
    },
    SEARCH: {
        name: 'search',
        description: 'Search remote marketplaces and registries for skills',
        arg: '<keyword>',
        argDescription: 'search query filter string'
    },

    // Creation & Publishing
    CREATE: {
        name: 'create',
        description: 'Interactive prompt or path reference to configure a new skill template structure'
    },
    PUBLISH: {
        name: 'publish',
        description: 'Publish a skill to your remote active registry (requires authentication)',
        arg: '<skill-with-version>',
        argDescription: 'formatted package coordinate string (e.g. skill-name:1.0.0)'
    },
    DELETE_REMOTE: {
        name: 'delete-remote',
        description: 'Delete a skill from a remote registry architecture location',
        arg: '<skill-with-version>',
        argDescription: 'target package coordinate string (e.g. skill-name:1.0.0)'
    },

    // Authentication
    LOGIN: {
        name: 'login',
        description: 'Authenticate with your remote registry profile environment'
    },
    LOGOUT: {
        name: 'logout',
        description: 'End active verification session with the remote registry configuration'
    },

    // Security & Validation
    VERIFY: {
        name: 'verify',
        description: 'Verify integrity checksums and validation signatures of a local skill directory',
        arg: '<skill>',
        argDescription: 'the target skill name'
    },

    // Configuration & Environment
    DOCTOR: {
        name: 'doctor',
        description: 'Run diagnostics (environment sanity checks, registry connectivity, signature consistency)'
    }
};

const REGISTRY = ["github","npm","gitlab"]
const GLOBAL_SKILL_PATH = ["~/.copilot/skills", "~/.claude/skills", "~/.kiro/skills"]

module.exports = { CLI_NAME, CLI_DESCRIPTION, CLI_VERSION, OPTIONS, COMMANDS, REGISTRY,GLOBAL_SKILL_PATH };