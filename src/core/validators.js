import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

const SKILL_JSON_EXAMPLE = `{
  "name": "<skill-name>",
  "description": "Short description",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  }
}`

export function validateSkill(repoPath) {
    const manifestPath = path.join(repoPath, 'orca.json')

    if (!fs.existsSync(manifestPath)) {
        throw new Error(
            `Not a valid orca skill repository.\n` +
            `   ${chalk.yellow('•')} Missing orca.json at repository root\n` +
            `   Each skill repo must contain an orca.json manifest file\n\n` +
            `   Create orca.json in your repo root:\n` +
            `   ${chalk.cyan(SKILL_JSON_EXAMPLE.replace(/\n/g, '\n   '))}`
        )
    }

    let manifest
    try {
        manifest = fs.readJsonSync(manifestPath)
    } catch {
        throw new Error('orca.json is not valid JSON')
    }

    if (!manifest.name || !manifest.description || !manifest.version || !manifest.author) {
        throw new Error('orca.json must contain "name", "description", "version", and "author" fields')
    }

    console.log(`${chalk.cyan.bold('[ORCA]')} Validated skill: ${chalk.green(manifest.name)}`)
}
