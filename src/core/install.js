import { getRegistryUrl, getToken, promptGitCache } from '../utils/config.js'
import { DEFAULT_REGISTRY_URL } from '../utils/const.js'
import { validateSkill } from '../core/validators.js'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'

const ORCA = chalk.cyan.bold('[ORCA]')

function isAuthError(err) {
    const msg = err.stderr?.toString() || err.message || ''
    return msg.includes('403') || msg.includes('404') || msg.includes('Authentication failed') || msg.includes('could not read Username')
}

async function install(skill, options) {
    const tempDir = path.join(os.tmpdir(), "orca-tmp")

    try {
        const registryUrl = getRegistryUrl(options.registry)
        const repoUrl = `${registryUrl}/${skill}.git`

        console.log(`${ORCA} Installing skill -> ${skill}`)

        fs.removeSync(tempDir)

        // Try anonymous clone first
        try {
            execSync(`git clone "${repoUrl}" "${tempDir}"`, { stdio: "pipe" })
        } catch (err) {
            if (!isAuthError(err)) {
                throw err
            }

            let token = getToken(options.token)

            if (!token) {
                const useCache = await promptGitCache()
                if (useCache) {
                    token = 'GIT_CACHE'
                }
            }

            if (token === 'GIT_CACHE') {
                execSync(`git clone "${repoUrl}" "${tempDir}"`, { stdio: "pipe" })
            } else if (token) {
                const authUrl = repoUrl.replace('https://', `https://${token}@`)
                execSync(`git clone "${authUrl}" "${tempDir}"`, { stdio: "pipe" })
            } else {
                fs.removeSync(tempDir)
                console.error(`\n${chalk.red('ERROR')} Cannot access repository. Possible reasons:`)
                console.error(`   ${chalk.yellow('•')} The repository requires authentication`)
                console.error(`   ${chalk.yellow('•')} The repository URL may be incorrect`)
                console.error(`   ${chalk.yellow('•')} Your token may be invalid or expired\n`)
                console.error(`   To authenticate, use one of:`)
                console.error(`   ${chalk.yellow('•')} ${'orca install <skill> --token <pat>'}`)
                console.error(`   ${chalk.yellow('•')} ${'orca -c pat:<your-token>'}`)
                console.error(`   ${chalk.yellow('•')} ${'orca -c ssh:<your-ssh-key>'}`)
                process.exit(1)
            }
        }

        console.log(`${ORCA} Repository synced`)

        // Validate skill has orca.json manifest (skip for default registry)
        if (registryUrl !== DEFAULT_REGISTRY_URL) {
            validateSkill(tempDir)
        }

        const resolveTargets = () => {
            const dirs = []
            if (options.claude) dirs.push('.claude')
            if (options.copilot) dirs.push('.copilot')
            if (options.kiro) dirs.push('.kiro')

            if (dirs.length === 0 || dirs.length === 3) {
                return ['.agents']
            }
            return dirs
        }

        const installSkill = (targetRoot) => {
            fs.ensureDirSync(targetRoot)
            const dest = path.join(targetRoot, skill)
            fs.copySync(tempDir, dest, { overwrite: true })
        }

        const basePath = options.global ? os.homedir() : process.cwd()
        const mode = options.global ? 'Global' : 'Workspace'
        const targets = resolveTargets()

        console.log(`${ORCA} Mode -> ${mode} Deployment`)

        targets.forEach((target) => {
            const fullPath = path.join(basePath, target, 'skills')
            console.log(`${ORCA} Installing to -> ${fullPath}`)
            installSkill(fullPath)
        })

        fs.removeSync(tempDir)

        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" installed successfully`)

    } catch (e) {
        fs.removeSync(tempDir)
        console.error(`${chalk.red('ERROR')} ORCA: Installation failed ->`, e.message)
        process.exit(1)
    }
}

export { install }
