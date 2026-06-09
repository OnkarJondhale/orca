import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { getInstalledSkills } from '../utils/index.js'
import { validateSkill } from './index.js'

const ORCA = chalk.cyan.bold('[ORCA]')

const TARGET_DIRS = ['.agents', '.claude', '.copilot', '.kiro']

function updateSkill(skill, options) {
    if (options.file) {
        // Update from local path
        const sourcePath = path.resolve(options.file)

        if (!fs.existsSync(sourcePath)) {
            console.log(`${chalk.red('ERROR')} Path not found: ${sourcePath}`)
            process.exit(1)
        }

        if (!fs.statSync(sourcePath).isDirectory()) {
            console.log(`${chalk.red('ERROR')} Path is not a directory: ${sourcePath}`)
            process.exit(1)
        }

        validateSkill(sourcePath)
        console.log(`${ORCA} Updating skill "${skill}" from local path -> ${sourcePath}`)

        const scope = options.global ? 'global' : 'local'
        const basePath = options.global ? os.homedir() : process.cwd()
        let updated = false

        TARGET_DIRS.forEach(dir => {
            const destPath = path.join(basePath, dir, 'skills', skill)
            if (fs.existsSync(destPath)) {
                fs.copySync(sourcePath, destPath, { overwrite: true })
                console.log(`${ORCA} Updated -> ${destPath}`)
                updated = true
            }
        })

        if (!updated) {
            console.log(`${chalk.red('ERROR')} Skill "${skill}" not found in ${scope} scope`)
            console.log(`   Use ${chalk.cyan('orca install ' + skill)} to install it first`)
            process.exit(1)
        }

        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" updated successfully`)
        return
    }

    // Update from registry — re-install
    console.log(`${ORCA} Re-installing skill "${skill}" from registry...`)
    // Re-import install dynamically to avoid circular dependency
    import('./install.js').then(({ install }) => {
        install(skill, { ...options, file: undefined })
    }).catch(e => {
        console.error(`${chalk.red('ERROR')} ORCA: Update failed ->`, e.message)
        process.exit(1)
    })
}

export { updateSkill }
