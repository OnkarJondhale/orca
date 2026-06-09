import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import chalk from 'chalk'

const ORCA = chalk.cyan.bold('[ORCA]')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG_PATH = path.resolve(__dirname, '../../package.json')

const PKG = fs.readJsonSync(PKG_PATH)
const PKG_NAME = PKG.name || '@orca-skill-manager/orca'
const CURRENT_VERSION = PKG.version

function getLatestVersion() {
    try {
        const result = execSync(`npm view "${PKG_NAME}" version`, { encoding: 'utf-8', stdio: 'pipe' })
        return result.trim()
    } catch {
        throw new Error(`Could not fetch latest version from npm registry for "${PKG_NAME}"`)
    }
}

export function upgradeCLI(version) {
    const targetVersion = version || getLatestVersion()

    if (targetVersion === CURRENT_VERSION) {
        console.log(`${ORCA} Already at latest version ${chalk.green(CURRENT_VERSION)}`)
        return
    }

    console.log(`${ORCA} Upgrading ${chalk.cyan(PKG_NAME)}: ${chalk.gray(CURRENT_VERSION)} -> ${chalk.green(targetVersion)}`)

    const pkgSpec = version
        ? `"${PKG_NAME}@${version}"`
        : `"${PKG_NAME}@latest"`

    try {
        execSync(`npm install -g ${pkgSpec}`, { stdio: 'inherit' })
    } catch {
        console.error(`\n${chalk.red('ERROR')} Upgrade failed. Try manually:`)
        console.error(`   ${chalk.cyan(`npm install -g ${pkgSpec}`)}`)
        process.exit(1)
    }

    console.log(`${chalk.green('OK')} ORCA upgraded to ${chalk.green(targetVersion)}`)
}


