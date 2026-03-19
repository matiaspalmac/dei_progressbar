fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Dei'
description 'Progress Bar Universal - Dei Ecosystem'
version '1.0'


server_scripts {
    'server/main.lua',
}

client_scripts {
    'config.lua',
    'client/framework.lua',
    'client/nui.lua',
    'client/main.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/assets/js/app.js',
    'html/assets/css/themes.css',
    'html/assets/css/styles.css',
    'html/assets/fonts/*.otf',
}

exports {
    'Linear',
    'Circular',
    'Mini',
    'Semicircle',
    'Cancel',
    'IsActive',
}
