import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { ORCA_DIR, ORCA_CONFIG_FILE, ORCA_CREDENTIALS_FILE, DEFAULT_REPO_URL } from './const.js'

const VALID_KEYS = ['pat', 'ssh', 'registry']

function ensureOrcaDir() {
    fs.ensureDirSync(ORCA_DIR)
}

export function readConfig() {
    ensureOrcaDir()
    try {
        const data = fs.readJsonSync(ORCA_CONFIG_FILE, { throws: false })
        return data || {}
    } catch {
        return {}
    }
}

export function readCredentials() {
    ensureOrcaDir()
    try {
        const data = fs.readJsonSync(ORCA_CREDENTIALS_FILE, { throws: false })
        return data || {}
    } catch {
        return {}
    }
}

export function writeCredential(key, value) {
    if (!VALID_KEYS.includes(key)) {
        console.error(chalk.red(`Invalid key "${key}". Valid keys: ${VALID_KEYS.join(', ')}`))
        process.exit(1)
    }

    ensureOrcaDir()
    const creds = readCredentials()

    if (key in creds) {
        console.log(chalk.yellow(`Overwriting existing ${key} in ~/.orca/credentials`))
    }

    creds[key] = value
    fs.writeJsonSync(ORCA_CREDENTIALS_FILE, creds, { spaces: 2 })
    console.log(chalk.green(`${key} saved to ~/.orca/credentials`))
}

export function parseConfigPair(pair) {
    const colonIndex = pair.indexOf(':')
    if (colonIndex === -1 || colonIndex === 0 || colonIndex === pair.length - 1) {
        console.error(chalk.red('Invalid format. Use <key>:<value> (e.g., pat:ghp_xxx)'))
        process.exit(1)
    }
    const key = pair.slice(0, colonIndex)
    const value = pair.slice(colonIndex + 1)
    return [key, value]
}

export function getRepoUrl(registryFlag) {
    if (registryFlag && registryFlag !== 'github') {
        return registryFlag
    }

    const config = readConfig()
    return config.defaultRegistry || DEFAULT_REPO_URL
}

export function getToken(cliToken) {
    if (cliToken) return cliToken

    const creds = readCredentials()
    return creds.pat || creds.ssh || null
}

export async function promptGitCache() {
    const readline = (await import('readline')).default
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question('No token found. Try git cache? [y/N] ', (answer) => {
            rl.close()
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
        })
    })
}
