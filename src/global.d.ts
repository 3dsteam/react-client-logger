interface Console {
    // Original console functions
    _debug: (...args: unknown[]) => void;
    _log: (...args: unknown[]) => void;
    _warn: (...args: unknown[]) => void;
    _error: (...args: unknown[]) => void;
    // Custom console functions
    debug: (message: string, ...args: unknown[]) => void;
    log: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    critical: (message: string, ...args: unknown[]) => void;
}
