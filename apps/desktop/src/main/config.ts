import * as fs from 'node:fs'
import * as path from 'node:path'

// Define the configuration interface
export interface AppConfig {
  /**
   * The port number for the application server
   */
  port: number

  /**
   * The host address for the application server
   */
  host: string

  /**
   * Enable or disable debug mode
   */
  debug: boolean

  /**
   * Maximum number of concurrent agents
   */
  maxAgents: number

  /**
   * Directory for storing logs
   */
  logDir: string

  /**
   * Directory for storing checkpoints
   */
  checkpointDir: string
}

// Define default configuration values
export const DEFAULT_CONFIG: AppConfig = {
  port: 3000,
  host: 'localhost',
  debug: false,
  maxAgents: 5,
  logDir: './logs',
  checkpointDir: './checkpoints',
}

/**
 * Loads configuration from a JSON file
 * @param configPath Path to the configuration file
 * @returns The loaded configuration object
 */
export function loadConfig(configPath?: string): AppConfig {
  // If no config path is provided, look for a config file in common locations
  if (!configPath) {
    const possiblePaths = [
      path.join(process.cwd(), 'config.json'),
      path.join(process.cwd(), '.ur', 'config.json'),
      path.join(__dirname, '..', '..', 'config.json'),
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
      return { ...DEFAULT_CONFIG, ...configData }
    } catch (error) {
      // Only log errors in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Error loading config from ${configPath}:`, error)
      }
      // Fall back to default config if there's an error loading the file
      return { ...DEFAULT_CONFIG }
    }
  }

  // Return default config if no file was found or specified
  return { ...DEFAULT_CONFIG }
}

/**
 * Validates the configuration object
 * @param config The configuration object to validate
 * @returns An array of validation errors, or empty array if valid
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = []

  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    errors.push('Port must be a number between 1 and 65535')
  }

  if (typeof config.host !== 'string' || config.host.length === 0) {
    errors.push('Host must be a non-empty string')
  }

  if (typeof config.debug !== 'boolean') {
    errors.push('Debug must be a boolean value')
  }

  if (typeof config.maxAgents !== 'number' || config.maxAgents < 1) {
    errors.push('Max agents must be a positive number')
  }

  if (typeof config.logDir !== 'string' || config.logDir.length === 0) {
    errors.push('Log directory must be a non-empty string')
  }

  if (typeof config.checkpointDir !== 'string' || config.checkpointDir.length === 0) {
    errors.push('Checkpoint directory must be a non-empty string')
  }

  return errors
}