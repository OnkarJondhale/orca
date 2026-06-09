// ─────────────────────────────────────────────────────
// @orca/utils - Defines constants & metadata definitions
// ─────────────────────────────────────────────────────

import path from 'path'
import os from 'os'

export const CLI_NAME = "orca";
export const CLI_DESCRIPTION = "SKILL manager for agentic workflows";
export const CLI_VERSION = "1.0.3";

export const OPTIONS = {
    VERBOSE: {
        flags: '-v, --verbose',
        description: 'enable verbose logging'
    },
    CONFIG: {
        flags: '-c, --config <key:value>',
        description: 'set credential key:value pair (keys: pat, ssh, registry)'
    },
    TOKEN: {
        flags: '--token <pat>',
        description: 'GitHub Personal Access Token for private repo authentication'
    },
    TYPE: {
        flags: '-t, --type <type>',
        description: 'type of skill (e.g., tool, model)',
        default: 'tool'
    },
    REGISTRY: {
        flags: '--registry <url>',
        description: 'GitHub user/org base URL (e.g., https://github.com/username)'
    },
    NAME: {
        flags: '--name <name>',
        description: 'custom name for the skill (defaults to the skill directory name)'
    },
    GLOBAL: {
        flags: '-g, --global',
        description: 'install target globally across all active IDE environments'
    },
    CLAUDE: {
        flags: '--claude',
        description: 'install skill for Claude AI'
    },
    COPILOT: {
        flags: '--copilot',
        description: 'install skill for GitHub Copilot'
    },
    KIRO: {
        flags: '--kiro',
        description: 'install skill for Kiro AI'
    },
    LIST_ALL: {
        flags: '-a, --all',
        description: 'list all skills (local and global)'
    },
    MARKETPLACE: {
        flags: '--marketplace',
        description: 'list official skills from orca marketplace'
    },
    REMOTE: {
        flags: '--remote',
        description: 'list skills from the configured remote registry'
    },
    FILE: {
        flags: '-f, --file <path>',
        description: 'install/delete/update a skill from a local file path'
    },
    PATH: {
        flags: '--path',
        description: 'show the full file path of each skill'
    },
    HELP: {
        flags: '-h, --help',
        description: 'Show help and usage information'
    }
};

export const COMMANDS = {
    // Core Lifecycle
    INSTALL: {
        name: 'install',
        description: 'Install a skill from registry, git repo, or local path',
        arg: '[skill]',
        argDescription: 'name of the skill (derived from -f path if omitted)'
    },
    DELETE: {
        name: 'delete',
        description: 'Delete a skill from local storage',
        arg: '[skill]',
        argDescription: 'name of the skill to delete (omit if using -f)'
    },
    UPDATE: {
        name: 'update',
        description: 'Update a specific skill to latest version',
        arg: '[skill]',
        argDescription: 'the specific skill to update (leave empty to update the orca engine itself)'
    },
    UPGRADE: {
        name: 'upgrade',
        description: 'Update the orca CLI tool to latest or specific version',
        arg: '[version]',
        argDescription: 'target version (omit for latest)'
    },

    // Listing & Info
    LIST: {
        name: 'list',
        description: 'List skills installed locally'
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

export const DEFAULT_REGISTRY_URL = "https://github.com/OnkarJondhale/orca-skills.git"
export const MARKETPLACE_URL = "https://github.com/OnkarJondhale/orca-skills.git"
export const ORCA_DIR = path.join(os.homedir(), ".orca")
export const ORCA_CONFIG_FILE = path.join(ORCA_DIR, "config.json")
export const ORCA_CREDENTIALS_FILE = path.join(ORCA_DIR, "credentials")
export const ORCA_INSTALLED_FILE = path.join(ORCA_DIR, "installed.json")