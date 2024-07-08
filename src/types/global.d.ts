interface Console {
    // Original console functions
    _debug: (...args: unknown[]) => void;
    _info: (...args: unknown[]) => void;
    _warn: (...args: unknown[]) => void;
    _error: (...args: unknown[]) => void;
    // Custom console functions
    critical: (message: string, ...args: unknown[]) => void;
}
