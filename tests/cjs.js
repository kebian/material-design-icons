const { categories, icons } = require('../index.js')
const assertArrayWithContent = arr => {
    if (!Array.isArray(arr)) throw "Not an array"
    if (!arr.length) throw "Empty array"
}
assertArrayWithContent(categories)
assertArrayWithContent(icons)
