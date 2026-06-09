import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { execSync } from 'child_process'
import { getInstalledSkills, MARKETPLACE_URL, getRegistryUrl } from '../utils/index.js'

function pad(text, len) {
    return text.length > len ? text.slice(0, len - 1) : text + ' '.repeat(len - text.length)
}

function printTable(rows, showPath) {
    if (rows.length === 0) {
        console.log(chalk.yellow('No skills found'))
        return
    }

    const colWidths = {
        name: Math.max(4, ...rows.map(r => r.name.length)),
        scope: Math.max(5, ...rows.map(r => r.scope.length)),
        date: Math.max(9, ...rows.map(r => r.date.length)),
        official: Math.max(8, ...rows.map(r => r.official.length)),
        author: Math.max(6, ...rows.map(r => r.author.length))
    }

    if (showPath) {
        colWidths.path = Math.max(4, ...rows.map(r => r.path ? r.path.length : 0))
    }

    const sep = `  ${chalk.gray('│')}  `

    const cols = showPath
        ? ['Name', 'Scope', 'Installed', 'Official', 'Author', 'Path']
        : ['Name', 'Scope', 'Installed', 'Official', 'Author']

    const h = (text, width) => chalk.cyan.bold(pad(text, width))
    const header = cols.map((c, i) => {
        const key = c.toLowerCase()
        const widths = [colWidths.name, colWidths.scope, colWidths.date, colWidths.official, colWidths.author]
        if (showPath) widths.push(colWidths.path)
        return h(c, widths[i])
    }).join(sep)

    const d = (width) => chalk.gray('─'.repeat(width))
    const divider = cols.map((c, i) => {
        const key = c.toLowerCase()
        const widths = [colWidths.name, colWidths.scope, colWidths.date, colWidths.official, colWidths.author]
        if (showPath) widths.push(colWidths.path)
        return d(widths[i])
    }).join(chalk.gray('──┼──'))

    console.log(`\n${header}`)
    console.log(` ${divider}`)

    rows.forEach(r => {
        const fmt = (text, width, color) => {
            const padded = pad(text || '-', width)
            return color ? color(padded) : padded
        }
        const values = [r, r, r, r, r]
        const fields = ['name', 'scope', 'date', 'official', 'author']
        const colors = ['nameColor', 'scopeColor', 'dateColor', 'officialColor', 'authorColor']
        if (showPath) { fields.push('path'); colors.push('pathColor') }
        const line = fields.map((f, i) => {
            const widths = [colWidths.name, colWidths.scope, colWidths.date, colWidths.official, colWidths.author]
            if (showPath) widths.push(colWidths.path)
            return fmt(r[f], widths[i], r[colors[i]] || null)
        }).join(sep)
        console.log(` ${line}`)
    })
    console.log()
}

function buildRow(s, showPath) {
    const row = {
        name: s.name,
        nameColor: null,
        scope: s.scope,
        scopeColor: s.scope === 'global' ? chalk.magenta : s.scope === 'local' ? chalk.cyan : null,
        date: s.installedDate ? s.installedDate.slice(0, 10) : '-',
        dateColor: s.dateColor || null,
        official: s.isOfficial ? 'yes' : 'no',
        officialColor: s.isOfficial ? chalk.green : chalk.yellow,
        author: s.author || 'NA',
        authorColor: null
    }
    if (showPath) {
        row.path = s.path || '-'
        row.pathColor = s.path ? chalk.gray : chalk.gray
    }
    return row
}

export function listLocal(opts) {
    const TARGET_DIRS = ['.agents', '.claude', '.copilot', '.kiro']
    const cwd = process.cwd()
    const showPath = opts && opts.path

    const tracked = getInstalledSkills()

    const seen = new Set()
    const rows = []

    TARGET_DIRS.forEach(dir => {
        const skillsDir = path.join(cwd, dir, 'skills')
        if (!fs.existsSync(skillsDir)) return

        fs.readdirSync(skillsDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .forEach(d => {
                if (seen.has(d.name)) return
                seen.add(d.name)

                const track = tracked.find(s => s.name === d.name && s.scope === 'local')
                const installPath = path.join(skillsDir, d.name)
                rows.push(buildRow({
                    name: d.name,
                    scope: 'local',
                    path: installPath,
                    installedDate: track ? track.installedDate : null,
                    isOfficial: track ? track.isOfficial : false,
                    author: track ? track.author : 'NA',
                    dateColor: track ? null : chalk.gray
                }, showPath))
            })
    })

    console.log(`\n${chalk.cyan.bold('[ORCA]')} Installed skills (local)`)
    printTable(rows, showPath)
}

export function listAll(opts) {
    const showPath = opts && opts.path
    const skills = getInstalledSkills()
    const rows = skills.map(s => buildRow(s, showPath))
    console.log(`\n${chalk.cyan.bold('[ORCA]')} Installed skills (all)`)
    printTable(rows, showPath)
}

export function listMarketplace(opts) {
    const showPath = opts && opts.path
    const tempDir = path.join(os.tmpdir(), 'orca-list-tmp')

    console.log(`\n${chalk.cyan.bold('[ORCA]')} Fetching marketplace...`)

    fs.removeSync(tempDir)

    execSync(`git clone --depth 1 "${MARKETPLACE_URL}" "${tempDir}"`, { stdio: 'pipe' })

    const items = fs.readdirSync(tempDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'skills')
        .map(d => d.name)

    fs.removeSync(tempDir)

    const rows = items.map(name => ({
        name,
        nameColor: null,
        scope: '-',
        scopeColor: chalk.gray,
        date: '-',
        dateColor: chalk.gray,
        official: 'yes',
        officialColor: chalk.green,
        author: 'orca-skills',
        authorColor: null,
        ...(showPath ? { path: '-', pathColor: chalk.gray } : {})
    }))

    console.log(`\n${chalk.cyan.bold('[ORCA]')} Marketplace skills (OnkarJondhale/orca-skills)`)
    printTable(rows, showPath)
}

export function listRemote(opts) {
    const showPath = opts && opts.path
    const repoUrl = getRegistryUrl(null)
    const tempDir = path.join(os.tmpdir(), 'orca-list-tmp')

    console.log(`\n${chalk.cyan.bold('[ORCA]')} Fetching remote registry...`)

    fs.removeSync(tempDir)

    execSync(`git clone --depth 1 "${repoUrl}" "${tempDir}"`, { stdio: 'pipe' })

    const items = fs.readdirSync(tempDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'skills')
        .map(d => d.name)

    fs.removeSync(tempDir)

    const rows = items.map(name => ({
        name,
        nameColor: null,
        scope: 'remote',
        scopeColor: chalk.gray,
        date: '-',
        dateColor: chalk.gray,
        official: '-',
        officialColor: chalk.gray,
        author: '-',
        authorColor: chalk.gray,
        ...(showPath ? { path: '-', pathColor: chalk.gray } : {})
    }))

    console.log(`\n${chalk.cyan.bold('[ORCA]')} Remote registry skills`)
    printTable(rows, showPath)
}
