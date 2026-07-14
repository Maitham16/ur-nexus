import * as fs from 'node:fs'
import * as path from 'node:path'

// Define the server configuration interface
export interface ServerConfig {
  /**
   * The port number for the server
   */
  port: number

  /**
   * The host address for the server
   */
  host: string

  /**
   * Enable or disable debug mode
   */
  debug: boolean

  /**
   * Maximum number of concurrent connections
   */
  maxConnections: number

  /**
   * Directory for storing logs
   */
  logDir: string

  /**
   * Enable or disable CORS
   */
  cors: boolean

  /**
   * API key for authentication (optional)
   */
  apiKey?: string
}

// Define default configuration values
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3000,
  host: 'localhost',
  debug: false,
  maxConnections: 100,
  logDir: './logs',
  cors: false,
}

/**
 * Loads configuration from a JSON file or environment variables
 * @param configPath Optional path to the configuration file
 * @returns The loaded configuration object
 */
export function loadConfig(configPath?: string): ServerConfig {
  // Start with default config
  let config: ServerConfig = { ...DEFAULT_SERVER_CONFIG }

  // Load from environment variables
  const envConfig: Partial<ServerConfig> = {}

  if (process.env.SERVER_PORT) {
    envConfig.port = parseInt(process.env.SERVER_PORT, 10)
  }

  if (process.env.SERVER_HOST) {
    envConfig.host = process.env.SERVER_HOST
  }

  if (process.env.SERVER_DEBUG) {
    envConfig.debug = process.env.SERVER_DEBUG === 'true'
  }

  if (process.env.SERVER_MAX_CONNECTIONS) {
    envConfig.maxConnections = parseInt(process.env.SERVER_MAX_CONNECTIONS, 10)
  }

  if (process.env.SERVER_LOG_DIR) {
    envConfig.logDir = process.env.SERVER_LOG_DIR
  }

  if (process.env.SERVER_CORS) {
    envConfig.cors = process.env.SERVER_CORS === 'true'
  }

  if (process.env.SERVER_API_KEY) {
    envConfig.apiKey = process.env.SERVER_API_KEY
  }

  // Merge environment config
  config = { ...config, ...envConfig }

  // If no config path is provided, look for a config file in common locations
  if (!configPath) {
    const possiblePaths = [
      path.join(process.cwd(), 'server-config.json'),
      path.join(process.cwd(), '.ur', 'server-config.json'),
      path.join(__dirname, '..', 'server-config.json'),
    ]

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath
        break
      }
    }
  }

  // If we found a config file, load it
  if (configPath && fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf-8')
      const configData = JSON.parse(configFile)
      config = { ...config, ...configData }
    } catch (error) {
      console.error(`Error loading config from ${configPath}:`, error)
      // Fall back to environment/default config if there's an error loading the file
    }
  }

  return config
}

/**
 * Validates the server configuration object
 * @param config The configuration object to validate
 * @returns An array of validation errors, or empty array if valid
 */
export function validateConfig(config: ServerConfig): string[] {
  const errors: string[] = []

  if (typeof config.port !== 'number' || !Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('Port must be an integer between 1 and 65535')
  }

  if (typeof config.host !== 'string' || config.host.length === 0) {
    errors.push('Host must be a non-empty string')
  }

  if (typeof config.debug !== 'boolean') {
    errors.push('Debug must be a boolean value')
  }

  if (typeof config.maxConnections !== 'number' || config.maxConnections < 1) {
    errors.push('Max connections must be a positive number')
  }

  if (typeof config.logDir !== 'string' || config.logDir.length === 0) {
    errors.push('Log directory must be a non-empty string')
  }

  if (typeof config.cors !== 'boolean') {
    errors.push('CORS must be a boolean value')
  }

  if (config.apiKey !== undefined && typeof config.apiKey !== 'string') {
    errors.push('API key must be a string or undefined')
  }

  return errors
}
