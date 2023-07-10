export const TBD_SYMBOL = Symbol('ToBeDefined');

export const argsOptions = {
    port: {
        type: 'string',
        short: 'p',
        default: '8080',
    },
    file: {
        type: 'string',
        short: 'f',
        default: '.env',
    },
    variable: {
        type: 'string',
        short: 'v',
        default: 'CONFIG',
    },
    window: {
        type: 'boolean',
        short: 'w',
        default: false,
    },
    compress: {
        type: 'boolean',
        short: 'c',
        default: false,
    },
    json: {
        type: 'boolean',
        short: 'j',
        default: false,
    },
};
