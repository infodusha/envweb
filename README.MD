# envweb

Tiny app that serves environment variables as a javascript.

## Features

- Zero dependencies
- Only allowed envs are exposed
- Throws if env is not defined

## Usage

Create .env file:
```
PARAM=VALUE

NO_DEFAULT_VALUE
# COMMENTED
```

Run the app:
```sh
npx envweb
```

Configure reverse-proxy (optional, nginx example):
```
location /config.js {
    proxy_pass http://path/to/envweb/;
}
```

Include generated script (before the main app):
```html
<script src="config.js"></script>
```

Use in your app:
```javascript
console.log(CONFIG.PARAM); // Equals to VALUE or can be overriten in the env
```


## CLI arguments

Each argument can be passed as a flag or as a value (e.g. `--port 8080` or `--port=8080`).
Arguments have short aliases (e.g. `-p 8080`)

| Parameter  | Type      | Default  | Description                         |
|:-----------|:----------|:---------|:------------------------------------|
| `port`     | `string`  | `8080`   | Port where app is serverd           |
| `file`     | `string`  | `.env`   | Env filename to read                |
| `variable` | `string`  | `CONFIG` | Name of variable in global script   |
| `window`   | `boolean` | `false`  | If variable should be set to window |
| `compress` | `boolean` | `false`  | If script should be one-line        |

## Contributing

Contributions are always welcome!


## License

[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)
