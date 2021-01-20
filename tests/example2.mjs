import { twotone, categories } from '@kebian/material-design-icons'

categories.forEach(category => {
    category.icons.forEach(icon => {
        if (twotone.includes(icon)) {
            console.log(`Category ${category.name} has a twotone ${icon} icon`)
        }
    })
})
