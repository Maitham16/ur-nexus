import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { loadConfig, validateConfig, DEFAULT_CONFIG } from './config.js'

describe('config', () => {
  let tempDir: string
  let tempConfigPath: string

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-config-test-'))
    tempConfigPath = path.join(tempDir, 'config.json')
  })

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('loadConfig', () => {
    it('should return default config when no config file is found', () => {
      const config = loadConfig('/non/existent/path/config.json')
      expect(config).toEqual(DEFAULT_CONFIG)
    })

    it('should load config from a valid JSON file', () => {
      const customConfig = {
        port: 8080,
        host: '0.0.0.0',
        debug: true,
        maxAgents: 10,
        logDir: '/var/log/app',
        checkpointDir: '/var/checkpoints',
      }

      fs.writeFileSync(tempConfigPath, JSON.stringify(customConfig))

      const config = loadConfig(tempConfigPath)
      expect(config).toEqual({ ...DEFAULT_CONFIG, ...customConfig })
    })

    it('should return default config when JSON file is invalid', () => {
      fs.writeFileSync(tempConfigPath, 'invalid json content')

      const config = loadConfig(tempConfigPath)
      expect(config).toEqual(DEFAULT_CONFIG)
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
      expect(config.host).toBe(DEFAULT_CONFIG.host) // Should keep default
      expect(config.maxAgents).toBe(DEFAULT_CONFIG.maxAgents) // Should keep default
    })
  })

  describe('validateConfig', () => {
    it('should return no errors for valid config', () => {
      const errors = validateConfig(DEFAULT_CONFIG)
      expect(errors).toEqual([])
    })

    it('should return error for invalid port', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, port: 99999 }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Port must be a number between 1 and 65535')
    })

    it('should return error for empty host', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, host: '' }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Host must be a non-empty string')
    })

    it('should return error for invalid debug value', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, debug: 'true' as unknown as boolean }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Debug must be a boolean value')
    })

    it('should return error for invalid maxAgents value', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, maxAgents: -1 }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Max agents must be a positive number')
    })

    it('should return error for empty logDir', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, logDir: '' }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Log directory must be a non-empty string')
    })

    it('should return error for empty checkpointDir', () => {
      const invalidConfig = { ...DEFAULT_CONFIG, checkpointDir: '' }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Checkpoint directory must be a non-empty string')
    })

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        port: 99999,
        host: '',
        debug: 'true' as unknown as boolean,
      }
      const errors = validateConfig(invalidConfig)
      expect(errors).toContain('Port must be a number between 1 and 65535')
      expect(errors).toContain('Host must be a non-empty string')
      expect(errors).toContain('Debug must be a boolean value')
      expect(errors).toHaveLength(3)
    })
  })
})