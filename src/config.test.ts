import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { loadConfig, validateConfig, DEFAULT_SERVER_CONFIG } from './config.js'
import type { ServerConfig } from './config.js'

describe('config', () => {
  let tempDir: string
  let tempConfigPath: string

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-server-config-test-'))
    tempConfigPath = path.join(tempDir, 'server-config.json')
  })

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('loadConfig', () => {
    it('should return default config when no config file is found', () => {
      const config = loadConfig('/non/existent/path/server-config.json')
      expect(config).toEqual(DEFAULT_SERVER_CONFIG)
    })

    it('should load config from a valid JSON file', () => {
      const customConfig = {
        port: 8080,
        host: '0.0.0.0',
        debug: true,
        maxConnections: 200,
        logDir: '/var/log/server',
        cors: true,
        apiKey: 'test-api-key',
      }

      fs.writeFileSync(tempConfigPath, JSON.stringify(customConfig))

      const config = loadConfig(tempConfigPath)
      expect(config).toEqual({ ...DEFAULT_SERVER_CONFIG, ...customConfig })
    })

    it('should return default config when JSON file is invalid', () => {
      fs.writeFileSync(tempConfigPath, 'invalid json content')

      const config = loadConfig(tempConfigPath)
      expect(config).toEqual(DEFAULT_SERVER_CONFIG)
    })

    it('should merge partial config with defaults', () => {
      const partialConfig = {
        port: 8080,
        debug: true,
      }

      fs.writeFileSync(tempConfigPath, JSON.stringify(partialConfig))

      const config = loadConfig(tempConfigPath)
      expect(config.port).toBe(8080)
      expect(config.debug).toBe(true)
      expect(config.host).toBe(DEFAULT_SERVER_CONFIG.host) // Should keep default
      expect(config.maxConnections).toBe(DEFAULT_SERVER_CONFIG.maxConnections) // Should keep default
    })

    it('should load config from environment variables', () => {
      // Save original env vars
      const originalPort = process.env.SERVER_PORT
      const originalHost = process.env.SERVER_HOST
      const originalDebug = process.env.SERVER_DEBUG

      // Set test env vars
      process.env.SERVER_PORT = '9000'
      process.env.SERVER_HOST = '0.0.0.0'
      process.env.SERVER_DEBUG = 'true'

      const config = loadConfig()
      expect(config.port).toBe(9000)
      expect(config.host).toBe('0.0.0.0')
      expect(config.debug).toBe(true)

      // Restore original env vars
      process.env.SERVER_PORT = originalPort
      process.env.SERVER_HOST = originalHost
      process.env.SERVER_DEBUG = originalDebug
    })
  })

  describe('validateConfig', () => {
    it('should return no errors for valid config', () => {
      const errors = validateConfig(DEFAULT_SERVER_CONFIG)
      expect(errors).toEqual([])
    })

    it('should return error for invalid port', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, port: 99999 }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Port must be an integer between 1 and 65535')
    })

    it('should return error for empty host', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, host: '' }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Host must be a non-empty string')
    })

    it('should return error for invalid debug value', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, debug: 'true' as unknown as boolean }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Debug must be a boolean value')
    })

    it('should return error for invalid maxConnections value', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, maxConnections: -1 }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Max connections must be a positive number')
    })

    it('should return error for empty logDir', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, logDir: '' }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Log directory must be a non-empty string')
    })

    it('should return error for invalid cors value', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, cors: 'true' as unknown as boolean }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('CORS must be a boolean value')
    })

    it('should return error for invalid apiKey', () => {
      const invalidConfig = { ...DEFAULT_SERVER_CONFIG, apiKey: 123 as unknown as string }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('API key must be a string or undefined')
    })

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidConfig = {
        ...DEFAULT_SERVER_CONFIG,
        port: 99999,
        host: '',
        debug: 'true' as unknown as boolean,
      }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Port must be an integer between 1 and 65535')
      expect(errors).toContain('Host must be a non-empty string')
      expect(errors).toContain('Debug must be a boolean value')
      expect(errors).toHaveLength(3)
    })
  })
})
