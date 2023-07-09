import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import http from 'node:http';
import { argsOptions, TBD_SYMBOL } from './config.js';

function getArgs() {
    return parseArgs({ options: argsOptions }).values;
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

function buildScript(env, variable, isWindow, isCompress) {
    const json = JSON.stringify(env, undefined, isCompress ? undefined : 2);
    if (isWindow) {
        return `window.${variable} = ${json};`;
    }
    return `const ${variable} = ${json};`;
}

function createRequestHandler(script) {
    return (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        res.end(script);
    }
}

export async function main() {
    const args = getArgs();
    const envFromFile = await getEnvFromFile(args.file);
    const env = overrideWithProcessValues(envFromFile);
    checkNoTBDValues(env);
    const script = buildScript(env, args.variable, args.window, args.compress);
    const server = http.createServer(createRequestHandler(script));
    server.listen(args.port, () => {
        console.log(`Server is listening on port ${args.port}`);
    });
}
