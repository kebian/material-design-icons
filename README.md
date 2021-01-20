# material-design-icons
An npm package for self-hosting Google's Material Design Icons.

Fonts are pulled from Google's git repository and then used to generate the missing eot, woff and woff2 files.

Also exports icon and category lists.

## Example Sass Usage
```scss
@import '@kebian/material-design-icons/scss/material-design-icons';
```

## Example JS usage
```javascript
import { icons } from '@kebian/material-design-icons'

icons.forEach(icon => console.log('Icon name: ' + icon))
```

```javascript
import { twotone, categories } from '@kebian/material-design-icons'

categories.forEach(category => {
    category.icons.forEach(icon => {
        if (twotone.includes(icon)) {
            console.log(`Category ${category.name} has a twotone ${icon} icon`)
        }
    })
})
```