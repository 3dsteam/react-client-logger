# React Client Logger

## Features

- Salvataggio logger su DB locale (IndexedDB)
- Sincronizzazione logger con server
- Override delle funzioni console (optional)
- Creazione funzione per il salvataggio dei logger
- Intercettazione di errori non gestiti (window.onerror) e Promise rejection (window.onunhandledrejection)
- Configurazione livello dei logger da salvare
- Configurazione livello dei logger da sincronizzare
- Gestione dei breadcrumb per i logger precedenti l'evento da sincronizzare (level >= config.level)
- Sincronizzazione automatica dei logger con il server al momento della creazione
- Sincronizzazione tramite intervallo per i logger non sincronizzati
- Gestione dei chunk per la sincronizzazione

## How to use

```typescript jsx
import { ClientLoggerProvider } from "react-client-logger";

// Import context provider
<ClientLoggerProvider>
    <App />
</ClientLoggerProvider>;
```

## How it works

WIP

## Properties

| Prop                     | Type                  | Default                                         | Description                        |
|--------------------------|-----------------------|-------------------------------------------------|------------------------------------| 
| enabled                  | `boolean`             | `true`                                          | Enable the logger saving              |
| overrideConsoleFunctions | `boolean`             | `true`                                          | Override `console` functions       |
| config                   | `IClientLoggerConfig` | see [IClientLoggerConfig](#IClientLoggerConfig) | ClientLoggerProvider configuration |
| syncConfig               | `ILogSyncerConfig`    | see [ILogSyncerConfig](#ILogSyncerConfig)       | Sync records configuration         |

## Types and enums

### IClientLoggerConfig

| Prop         | Type                  | Default           | Description                                         |
|--------------|-----------------------|-------------------|-----------------------------------------------------|
| logLevel     | [LogLevel](#LogLevel) | `LogLevel.INFO`   | Minimum logger level to save                           |
| ignoreLevels | [LogLevel](#LogLevel) | `ELogLevel.DEBUG` | Logs with level under or equal this will be ignored |
| breadcrumb   | `boolean`             | `true`            | Maximum breadcrumbs to save into logger                |

### ILogSyncerConfig

| Prop     | Type                              | Default                                | Description                                  |
|----------|-----------------------------------|----------------------------------------|----------------------------------------------|
| endpoint | `string`                          | `/api/logs`                            | Server endpoint to sync logs                 |
| headers  | `Record<string, string>`          | `{"Content-Type": "application/json"}` | Headers to send to server                    |
| chunk    | `number`                          | `10`                                   | Maximum logs to send in chunk                |
| interval | `number`                          | `60000`                                | Interval to sync logs not synced on creation |
| parser   | `(logs: ILogSaving[]) => unknown` | `(logs: ILogSaving[]) => ({ logs })`   | Function: parse logs for the upload request  |

### LogLevel

| Enum       | Value |
|------------|-------|
| `NOTSET`   | `0`   |
| `DEBUG`    | `10`  |
| `INFO`     | `20`  |
| `WARNING`  | `30`  |
| `ERROR`    | `40`  |
| `CRITICAL` | `50`  |

## Authors

- [@lorenzo-bonatti](https://github.com/lorenzo-bonatti)
