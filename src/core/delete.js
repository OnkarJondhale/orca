import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { getInstalledSkills, removeInstalledSkill } from '../utils/index.js'

const ORCA = chalk.cyan.bold('[ORCA]')

const TARGET_DIRS = ['.agents', '.claude', '.copilot', '.kiro']

function getWorkspacePaths(skill) {
    return TARGET_DIRS.map(dir => path.join(process.cwd(), dir, 'skills', skill))
}

function getGlobalPaths(skill) {
    return TARGET_DIRS.map(dir => path.join(os.homedir(), dir, 'skills', skill))
}

function deleteSkill(paths) {
    const found = paths.filter(p => fs.existsSync(p))

    if (found.length === 0) {
        return null
    }

    found.forEach(p => {
        fs.removeSync(p)
        console.log(`${ORCA} Deleted from ${path.dirname(path.dirname(p))}`)
    })

    return found
}

function deleteSkillCmd(skill, options) {
    // Delete by file path
    if (options.file) {
        const targetPath = path.resolve(options.file)

        if (!fs.existsSync(targetPath)) {
            console.log(`${chalk.red('ERROR')} Path not found: ${targetPath}`)
            process.exit(1)
        }

        if (!fs.statSync(targetPath).isDirectory()) {
            console.log(`${chalk.red('ERROR')} Path is not a directory: ${targetPath}`)
            process.exit(1)
        }

        fs.removeSync(targetPath)

        // Remove from tracking by matching path
        const tracked = getInstalledSkills()
        const match = tracked.find(s => s.path && path.resolve(s.path) === targetPath)
        if (match) {
            removeInstalledSkill(match.name, match.scope)
        }

        console.log(`${chalk.green('OK')} ORCA: Deleted skill at ${targetPath}`)
        return
    }

    if (options.global) {
        const globalPaths = getGlobalPaths(skill)
        const deleted = deleteSkill(globalPaths)

        if (!deleted) {
            console.log(`${chalk.red('ERROR')} Skill "${skill}" not found in global location`)
            console.log(`   Checked: ~/.agents, ~/.claude, ~/.copilot, ~/.kiro`)
            process.exit(1)
        }

        removeInstalledSkill(skill, 'global')
        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" deleted globally`)
        return
    }

    // Workspace delete
    const workspacePaths = getWorkspacePaths(skill)
    const deleted = deleteSkill(workspacePaths)

    if (deleted) {
        removeInstalledSkill(skill, 'local')
        console.log(`${chalk.green('OK')} ORCA: Skill "${skill}" deleted from workspace`)
        return
    }

    // Not found in workspace — check global
    const globalPaths = getGlobalPaths(skill)
    const globalFound = globalPaths.filter(p => fs.existsSync(p))

    if (globalFound.length > 0) {
        console.log(`${chalk.yellow('WARNING')} Skill "${skill}" is installed globally`)
        console.log(`   Use ${chalk.cyan('orca delete --global ' + skill)} to delete it`)
        process.exit(1)
    }

    console.log(`${chalk.red('ERROR')} Skill "${skill}" not found`)
    console.log(`   Checked: ./.agents, ./.claude, ./.copilot, ./.kiro`)
    process.exit(1)
}

export { deleteSkillCmd }
