import { REGISTRY } from '../utils/const.js'
import { getRepoUrl, getToken, promptGitCache } from '../utils/config.js'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'

const ORCA = chalk.cyan.bold('[ORCA]')

function clone(repoUrl, dest, authUrl) {
    const url = authUrl || repoUrl
    execSync(`git clone --filter=blob:none --no-checkout "${url}" "${dest}"`, {
        stdio: "pipe"
    })
}

function isAuthError(err) {
    const msg = err.stderr?.toString() || err.message || ''
    return msg.includes('403') || msg.includes('404') || msg.includes('Authentication failed') || msg.includes('could not read Username')
}

async function install(skill, options) {
    try {
        if (options.registry && !REGISTRY.includes(options.registry) && !options.registry.startsWith('http')) {
            throw new Error(`Invalid registry\nValid registries: ${REGISTRY.join(', ')}\nOr provide a full GitHub repo URL`)
        }

        const repoUrl = getRepoUrl(options.registry)
        const tempDir = path.join(os.tmpdir(), "orca-tmp")

        console.log(`${ORCA} Installing skill -> ${skill}`)

        fs.removeSync(tempDir)

        // Try anonymous clone first
        try {
            clone(repoUrl, tempDir)
        } catch (err) {
            if (!isAuthError(err)) {
                throw err
            }

            // Auth required — try to get a token
            let token = getToken(options.token)

            if (!token) {
                const useCache = await promptGitCache()
                if (useCache) {
                    // Let git use its credential helper
                    token = 'GIT_CACHE'
                }
            }

            if (token === 'GIT_CACHE') {
                // Retry without explicit token — git will use its credential helper
                clone(repoUrl, tempDir)
            } else if (token) {
                const authUrl = repoUrl.replace('https://', `https://${token}@`)
                clone(repoUrl, tempDir, authUrl)
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

        execSync(`git sparse-checkout init --cone`, {
            cwd: tempDir,
            stdio: "pipe"
        })

        execSync(`git sparse-checkout set ${skill}`, {
            cwd: tempDir,
            stdio: "pipe"
        })

        execSync(`git checkout`, {
            cwd: tempDir,
            stdio: "pipe"
        })

        console.log(`${ORCA} Fetching skill -> ${skill}`)

        const sourcePath = path.join(tempDir, skill)

        if (!fs.existsSync(sourcePath)) {
            fs.removeSync(tempDir)
            throw new Error(`Skill "${skill}" not found in registry`)
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

        fs.removeSync(tempDir)

        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" installed successfully`)

    } catch (e) {
        console.error(`${chalk.red('ERROR')} ORCA: Installation failed ->`, e.message)
        process.exit(1)
    }
}

export { install }
