const plugins = [
    [
        'babel-plugin-import',
        {
            'libraryName': '@material-ui/core',
            'libraryDirectory': 'esm',
            'camel2DashComponentName': false
        },
        'core'
    ],
    [
        'babel-plugin-import',
        {
            'libraryName': '@material-ui/icons',
            'libraryDirectory': 'esm',
            'camel2DashComponentName': false
        },
        'icons'
    ],
    [
        'babel-plugin-transform-imports',
        {
            '@material-ui/core': {
                'transform': '@material-ui/core/esm/${member}',
                'preventFullImport': true
            },
            '@material-ui/icons': {
                'transform': '@material-ui/icons/esm/${member}',
                'preventFullImport': true
            }
        }
    ]
];

module.exports = {plugins};
