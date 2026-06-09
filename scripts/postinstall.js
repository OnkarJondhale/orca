import fs from 'fs-extra'
import path from 'path'
import os from 'os'

const ORCA_DIR = path.join(os.homedir(), '.orca')
const CONFIG_PATH = path.join(ORCA_DIR, 'config.json')

if (!fs.existsSync(CONFIG_PATH)) {
    fs.ensureDirSync(ORCA_DIR)
    fs.writeJsonSync(CONFIG_PATH, {
        defaultRegistry: 'https://github.com/OnkarJondhale/orca-skills.git'
    }, { spaces: 2 })
    console.log('Created ~/.orca/config.json')
}
