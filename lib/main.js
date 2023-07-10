import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import http from 'node:http';
import { argsOptions, TBD_SYMBOL } from './config.js';

function getArgs() {
    const { values, tokens } =  parseArgs({ options: argsOptions, tokens: true });
    if (values.json) {
        const hasWindow = tokens.find((token) => token.name === 'window');
        const hasVariable = tokens.find((token) => token.name === 'variable');
        if (hasWindow || hasVariable) {
            throw new Error('Cannot use --json with --window or --variable');
        }
    }
    return values;
}

async function getEnvFromFile(filename) {
    const content = await fs.readFile(filename, { encoding: 'utf8' });
    return content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .reduce((acc, line) => {
            const { key, value } = parseEnvLine(line);
            acc[key] = value;
            return acc;
        }, Object.create(null));
}


function parseEnvLine(str) {
    const index = str.indexOf('=');
    if (index === -1) {
        return { key: str, value: TBD_SYMBOL };
    }
    const key = str.slice(0, index);
    return { key, value: str.slice(index + 1) };
}

function overrideWithProcessValues(env) {
    return Object.keys(env).reduce((acc, key) => {
        acc[key] = process.env[key] ?? env[key];
        return acc;
    }, Object.create(null));
}

function checkNoTBDValues(env) {
    const tbd = Object.entries(env).find(([, value]) => value === TBD_SYMBOL);
    if (tbd) {
        throw new Error(`Value for '${tbd[0]}' should be defined`);
    }
}

function buildJson(env, isCompress) {
    return JSON.stringify(env, undefined, isCompress ? undefined : 2);
}

function buildScript(json, variable, isWindow) {
    if (isWindow) {
        return `window.${variable} = ${json};`;
    }
    return `const ${variable} = ${json};`;
}

function createRequestHandler(env, args) {
    const json = buildJson(env, args.compress);
    const contentType = args.json ? 'application/json' : 'application/javascript';
    const content = args.json ? json : buildScript(json, args.variable, args.window);
    return (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(content);
    }
}

export async function main() {
    const args = getArgs();
    const envFromFile = await getEnvFromFile(args.file);
    const env = overrideWithProcessValues(envFromFile);
    checkNoTBDValues(env);
    const handler = createRequestHandler(env, args);
    const server = http.createServer(handler);
    server.listen(args.port, () => {
        console.log(`Server is listening on port ${args.port}`);
    });
}
