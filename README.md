![Logo](https://www.3ds.team/3dsteam.svg)

# React Client Logger

A React context provider for client-side logging with server sync and real-time configuration.

![License](https://img.shields.io/github/license/3dsteam/react-intl-number-input)

## Installation

```bash
  npm install @3dsteam/react-client-logger
```

### Prerequisites

For this package you need to have a `.npmrc` file in your project root with the following content:

```text
@3dsteam:registry=https://npm.pkg.github.com
```

## Usage / Examples

### Import provider

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css';

// Import ClientLogger provider
import {ClientLoggerProvider} from 'react-client-logger';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ClientLoggerProvider>
            <App/>
        </ClientLoggerProvider>
    </React.StrictMode>,
)
```

You can pass some configuration to the provider:

| Property      | Type                                        | Defaults    | Description                                                                                                 |
|---------------|---------------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------|
| `...config`   | `Partial<IClientLoggerConfig> \| undefined` | `undefined` | Config for sync configuration from server. **With `undefined` it takes all `IClientLoggerConfig` defaults** |
| `syncConfigs` | `SyncConfig \| booean \| undefined`         | `false`     | Config for sync configuration from server                                                                   |
| `debugMode`   | ` booean \| undefined`                      | `false`     | Enable debug mode                                                                                           |

### Add new Log

```tsx
import {useClientLogger, ELogLevel} from 'react-client-logger';

export default function App() {
    const {log} = useClientLogger();

    const handleLogMessage = () => {
        /**
         * Add log with default settings
         * (level = ELogLevel.INFO)
         */
        log('Hello, world!');
    }

    const handleLogError = () => {
        /**
         * Log with custom level
         * You can pass all the properties of ILog interface
         */
        log({
            message: 'My error message',
            level: ELogLevel.ERROR,
        })
    }

    return (
        <div>
            <h1>React App</h1>
            <hr/>
            <button onClick={handleLogMessage}>Log message</button>
            <button onClick={handleLogError}>Log error</button>
        </div>
    )
}
```

### Run sync manually

```tsx
import {useClientLogger, ELogLevel} from 'react-client-logger';

export default function App() {
    const {sync} = useClientLogger();

    const handleSync = () => {
        sync();
    }

    return (
        <div>
            <h1>React App</h1>
            <hr/>
            <button onClick={handleSync}>Sync logs</button>
        </div>
    )
}
```


### ILog

| Property    | Type                     | Defaults          | Description                                               |
|-------------|--------------------------|-------------------|-----------------------------------------------------------|
| `uuid`      | `string \| undefined`    | Gen. Uuid v4      | Log identifier **With `undefined` it generate a Uuid v4** |
| `trace`     | `string \| undefined`    | `undefined`       | The trace is string to group logs together.               |
| `session`   | `string \| undefined`    | Gen. Uuid v4      | Session UUID (generated at start-up with a Uuid v4)       |
| `level`     | `ELogLevel \| undefined` | `ELogLevel.INFO`  | The level of the log                                      |
| `message`   | `string`                 | No default        | The message of the log                                    |
| `content`   | `any \| undefined`       | `undefined`       | Dynamic log content                                       |
| `timestamp` | `number \| undefined`    | Current timestamp | Timestamp in milliseconds                                 |
| `user`      | `string \| undefined`    | `undefined`       | User reference                                            |
| `device`    | `any \| undefined`       | `undefined`       | Device details                                            |

### IClientLoggerConfig

| Property       | Type                                  | Defaults          | Description                                            |
|----------------|---------------------------------------|-------------------|--------------------------------------------------------|
| `endpoint`     | `string \| undefined`                 | `/api/logs`       | Server endpoint to sync logs                           | 
| `headers`      | `Record<string, string> \| undefined` | `{}`              | Headers to send to server                              | 
| `logLevel`     | `ELogLevel \| undefined`              | `ELogLevel.ERROR` | Minimum log level to save                              | 
| `enableSync`   | `boolean \| undefined`                | `true`            | Enable sync logs to server                             | 
| `syncInterval` | `number \| undefined`                 | `5`               | Interval to sync logs to server (in minutes)           | 
| `liveSync`     | `boolean \| undefined`                | `true`            | Sync logs to server in real time when new log is added | 

### SyncConfig

| Property             | Type                                              | Defaults           | Description                     |
|----------------------|---------------------------------------------------|--------------------|---------------------------------|
| `endpoint`           | `string \| undefined`                             | `/api/logs/config` | Server endpoint to sync configs | 
| `headers`            | `Record<string, string> \| undefined`             | `{}`               | Headers to send to server       | 
| `enableSync`         | `boolean \| undefined`                            | `true`             | Enable sync                     | 
| `syncInterval`       | `number \| undefined`                             | `10`               | Sync interval in minutes        | 
| `syncResponseParser` | `(data: any) => IClientLoggerConfig \| undefined` | `undefined`        | Custom response parser          |

## Authors

- [@lorenzo-bonatti](https://github.com/lorenzo-bonatti)

## License

[MIT](https://choosealicense.com/licenses/mit/)
