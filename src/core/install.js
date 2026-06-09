import { REGISTRY } from '../utils/const.js'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

function run(cmd, options = {}) {
    execSync(cmd, {
        stdio: options.silent ? "pipe" : "pipe",
        ...options
    })
}

function install(skill, options) {
    try {
        let registry = "github"

        // Validate registry
        if (options.registry) {
            if (!REGISTRY.includes(options.registry)) {
                throw new Error(`Invalid registry\nValid Registries are: ${REGISTRY.join(', ')}`)
            }
            console.log(`🦎 ORCA: Target registry -> ${options.registry}`)
            registry = options.registry
        }

        const repoUrl = "https://github.com/OnkarJondhale/orca-skills.git"
        const tempDir = path.join(os.tmpdir(), "orca-tmp")

        console.log(`🦎 ORCA: Installing skill -> ${skill}`)

        // 1. Clean temp folder
        fs.removeSync(tempDir)

        // 2. Clone repo (silent)
        execSync(`git clone --filter=blob:none --no-checkout ${repoUrl} "${tempDir}"`, {
            stdio: "pipe"
        })

        console.log(`🦎 ORCA: Repository synced`)

        // 3. Sparse checkout (use cwd instead of cd chaining)
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

        console.log(`🦎 ORCA: Fetching skill -> ${skill}`)

        const sourcePath = path.join(tempDir, skill)

        // 4. Validate skill exists
        if (!fs.existsSync(sourcePath)) {
            fs.removeSync(tempDir)
            throw new Error(`Skill "${skill}" not found in registry`)
        }

        // 5. Resolve target directories based on flags
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

        console.log(`🦎 ORCA: Mode -> ${mode} Deployment`)

        targets.forEach((target) => {
            const fullPath = path.join(basePath, target, 'skills')
            console.log(`🦎 ORCA: Installing to -> ${fullPath}`)
            installSkill(fullPath)
        })

        // 6. Cleanup
        fs.removeSync(tempDir)

        console.log(`✅ ORCA: Skill "${skill}" installed successfully`)

    } catch (e) {
        console.error(`❌ ORCA: Installation failed ->`, e.message)
        process.exit(1)
    }
}

export { install }