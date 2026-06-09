import { getRegistryUrl, getToken, promptGitCache, DEFAULT_REGISTRY_URL, addInstalledSkill } from '../utils/index.js'
import { validateSkill } from './index.js'
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
        const repoUrl = getRegistryUrl(options.registry)

        console.log(`${ORCA} Installing skill -> ${skill}`)

        fs.removeSync(tempDir)

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

        // Sparse checkout the skill directory
        execSync(`git sparse-checkout init --cone`, { cwd: tempDir, stdio: "pipe" })
        execSync(`git sparse-checkout set ${skill}`, { cwd: tempDir, stdio: "pipe" })
        execSync(`git checkout`, { cwd: tempDir, stdio: "pipe" })

        console.log(`${ORCA} Fetching skill -> ${skill}`)

        const sourcePath = path.join(tempDir, skill)

        if (!fs.existsSync(sourcePath)) {
            fs.removeSync(tempDir)
            throw new Error(`Skill "${skill}" not found in registry`)
        }

        if (repoUrl !== DEFAULT_REGISTRY_URL) {
            validateSkill(sourcePath)
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
            fs.copySync(sourcePath, dest, { overwrite: true })
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

        // Track installation
        const scope = options.global ? 'global' : 'local'
        const isOfficial = repoUrl === DEFAULT_REGISTRY_URL
        const author = isOfficial ? 'orca-skills' : 'NA'
        const installPath = path.join(basePath, targets[0], 'skills', skill)
        addInstalledSkill(skill, scope, isOfficial, author, installPath)

        fs.removeSync(tempDir)

        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" installed successfully`)

    } catch (e) {
        fs.removeSync(tempDir)
        console.error(`${chalk.red('ERROR')} ORCA: Installation failed ->`, e.message)
        process.exit(1)
    }
}

export { install }
