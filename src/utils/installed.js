import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { ORCA_INSTALLED_FILE } from './const.js'

const FILE_PATH = ORCA_INSTALLED_FILE

function ensureDir() {
    fs.ensureDirSync(path.dirname(FILE_PATH))
}

export function getInstalledSkills() {
    ensureDir()
    try {
        const data = fs.readJsonSync(FILE_PATH, { throws: false })
        return data || []
    } catch {
        return []
    }
}

function saveInstalledSkills(skills) {
    ensureDir()
    fs.writeJsonSync(FILE_PATH, skills, { spaces: 2 })
}

export function addInstalledSkill(name, scope, isOfficial, author, installPath) {
    const skills = getInstalledSkills()

    const existing = skills.find(s => s.name === name && s.scope === scope)
    if (existing) {
        existing.installedDate = new Date().toISOString()
        existing.isOfficial = isOfficial
        existing.author = author || 'NA'
        existing.path = installPath || existing.path
        saveInstalledSkills(skills)
        return
    }

    skills.push({
        name,
        scope,
        installedDate: new Date().toISOString(),
        isOfficial: isOfficial || false,
        author: author || 'NA',
        path: installPath || ''
    })

    saveInstalledSkills(skills)
}

export function removeInstalledSkill(name, scope) {
    let skills = getInstalledSkills()
    skills = skills.filter(s => !(s.name === name && s.scope === scope))
    saveInstalledSkills(skills)
}
