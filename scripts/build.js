const fs = require('fs')
const path = require('path')
const beautify = require("json-beautify")
const ttf2woff2 = require('ttf2woff2')
const { execSync } = require("child_process")
const gitFolder = 'material-design-icons'
const fontsFolder = 'fonts'
const dataDir = 'data'
const iconTypes = ['icons', 'outlined', 'round', 'sharp', 'twotone']

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

const generateFontsFromTtf = filename => {
    const shortname = path.basename(filename)
    const basename = path.basename(filename, path.extname(filename))
    const filePath = path.dirname(filename)
    const input = fs.readFileSync(filename)
    fs.writeFileSync(path.join(filePath, `${basename}.woff2`), ttf2woff2(input))
    execSync(`ttf2eot ${shortname} ${basename}.eot`, {cwd: filePath})
    execSync(`ttf2woff ${shortname} ${basename}.woff`, {cwd: filePath})   
}

const importFonts = () => {
    console.log("Importing fonts...")
    const dedupe = arr => [... new Set(arr)]
    const basenames = dedupe(fs.readdirSync(path.join(gitFolder, 'font')).map(filename => path.basename(filename, path.extname(filename))))
    const sourceFolder = path.join(gitFolder, 'font')

    basenames.forEach(basename => {
        if (fs.existsSync(path.join(sourceFolder, `${basename}.ttf`))) {
            const destinationTtf = path.join(fontsFolder, `${basename}.ttf`)
            fs.copyFileSync(path.join(sourceFolder, `${basename}.ttf`), destinationTtf)
            generateFontsFromTtf(destinationTtf)
        }
        else if (fs.existsSync(path.join(sourceFolder, `${basename}.otf`))) {
            fs.copyFileSync(path.join(sourceFolder, `${basename}.otf`), path.join(fontsFolder, `${basename}.otf`))
        }
    })
}

const buildLists = () => {
    const categories = []
    const icons = {}
    iconTypes.forEach(type => icons[type] = [])
    const srcDir = fs.readdirSync(path.join(gitFolder, 'src'))

    for (const categoryName of srcDir) {
        const categoryIcons = []
        const catPath = path.join(gitFolder, 'src', categoryName)
        const catDir = fs.readdirSync(catPath)
        for (const iconName of catDir) {
            categoryIcons.push(iconName)
            iconTypes.forEach(type => {
                const typeDirPath = type == 'icons' ? 'materialicons' : `materialicons${type}`
                if (fs.existsSync(path.join(catPath, iconName, typeDirPath))) icons[type].push(iconName)
            })
        }
        categories.push({
            name: categoryName,
            icons: categoryIcons
        })
    }
    return [categories, icons]
}

const exportData = (name, data) => {
    const s = 'module.exports = ' + beautify(data, null, 2, 0)
    fs.writeFileSync(`${dataDir}${path.sep}${name}.js`, s)
}

const importLists = () => {
    console.log('Importing icon lists...')
    const [categories, icons] = buildLists()
    let indexJs = ''
    let indexMjs = ''
    iconTypes.forEach(type => {
        exportData(type, icons[type])
        indexJs += `module.exports.${type} = require('./${type}.js')\n`
        indexMjs += `export { default as ${type} } from './${type}.js'\n`
    })
    exportData('categories', categories)
    indexJs += "module.exports.categories = require('./categories.js')\n"
    indexMjs += "export { default as categories } from './categories.js'\n"
    fs.writeFileSync(path.join(dataDir, 'index.js'), indexJs)
    fs.writeFileSync(path.join(dataDir, 'index.mjs'), indexMjs)
}

updateFromGit()
importFonts()
importLists()
