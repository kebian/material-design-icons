const fs = require('fs')
const path = require('path')
const beautify = require("json-beautify")
const ttf2woff2 = require('ttf2woff2')
const { execSync } = require("child_process")
const gitFolder = 'material-design-icons'
const fontsFolder = 'fonts'
const dataDir = 'data'

const updateFromGit = () => {
    if (fs.existsSync(gitFolder)) {
        console.log("Updating from Google's git...")
        execSync('git pull', {cwd: gitFolder})
    }
    else {
        console.log("Cloning from Google's git...")
        execSync(`git clone https://github.com/google/material-design-icons.git ${gitFolder}`)
    }
}

const importFonts = () => {
    console.log("Importing fonts...")
    const dir = fs.readdirSync(`${gitFolder}/font`)
    for (const filename of dir) {
        if (filename.endsWith('.ttf')) {
            fs.copyFileSync(`${gitFolder}/font/${filename}`, `${fontsFolder}/${filename}`)
        
            const basename = path.basename(filename, path.extname(filename))
            const input = fs.readFileSync(`${fontsFolder}/${filename}`)

            fs.writeFileSync(`${fontsFolder}/${basename}.woff2`, ttf2woff2(input))
            execSync(`ttf2eot ${filename} ${basename}.eot`, {cwd: fontsFolder})
            execSync(`ttf2woff ${filename} ${basename}.woff`, {cwd: fontsFolder})   
        }
    }
}

const buildLists = () => {
    const categories = []
    const icons = []
    const srcDir = fs.readdirSync(`${gitFolder}/src`)

    for (const categoryName of srcDir) {
        const categoryIcons = []
        const catDir = fs.readdirSync(`${gitFolder}/src/${categoryName}`)
        for (const iconName of catDir) {
            categoryIcons.push(iconName)
            icons.push(iconName)
        }
        categories.push({
            name: categoryName,
            icons: categoryIcons
        })
    }
    return [categories, icons]
}

const importLists = () => {
    console.log('Importing icon lists...')
    const [categories, icons] = buildLists()
    const catSting = 'module.exports = ' + beautify(categories, null, 2, 80)
    const iconString = 'module.exports = ' + beautify(icons, null, 2, 80)
    fs.writeFileSync(`${dataDir}/categories.js`, catSting)
    fs.writeFileSync(`${dataDir}/icons.js`, iconString)
}

updateFromGit()
importFonts()
importLists()
