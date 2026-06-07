const { REGISTRY, GLOBAL_SKILL_PATH } = require('../utils/const')
const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')

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
        const tempDir = path.join(process.cwd(), "temp")

        console.log(`🦎 ORCA: Installing skill -> ${skill}`)

        // 1. Clean temp folder
        fs.removeSync(tempDir)

        // 2. Clone repo (silent)
        execSync(`git clone --filter=blob:none --no-checkout ${repoUrl} temp`, {
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

        // 5. Install path
        const installSkill = (targetRoot) => {
            fs.ensureDirSync(targetRoot)

            const dest = path.join(targetRoot, skill)

            fs.copySync(sourcePath, dest, { overwrite: true })
        }

        // GLOBAL INSTALL
        if (options.global) {
            console.log(`🦎 ORCA: Mode -> Global Deployment`)

            GLOBAL_SKILL_PATH.forEach((targetPath) => {
                console.log(`🦎 ORCA: Installing to -> ${targetPath}`)
                installSkill(targetPath)
            })
        }

        // WORKSPACE INSTALL
        else {
            console.log(`🦎 ORCA: Mode -> Workspace Deployment`)

            const workspacePath = path.join(process.cwd(), ".agents", "skills")
            installSkill(workspacePath)
        }

        // 6. Cleanup
        fs.removeSync(tempDir)

        console.log(`✅ ORCA: Skill "${skill}" installed successfully`)

    } catch (e) {
        console.error(`❌ ORCA: Installation failed ->`, e.message)
        process.exit(1)
    }
}

module.exports = { install }