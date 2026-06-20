type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private formatMessage(level: LogLevel, message: string, context?: any) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    info(message: string, context?: any) {
        console.log(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: any) {
        console.warn(this.formatMessage('warn', message, context));
    }

    error(message: string, error?: any, context?: any) {
        const errDetails = error instanceof Error 
            ? { message: error.message, stack: error.stack } 
            : error;
        console.error(
            this.formatMessage('error', message, {
                ...context,
                error: errDetails,
            })
        );
    }

    debug(message: string, context?: any) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('debug', message, context));
        }
    }
}

export const logger = new Logger();
