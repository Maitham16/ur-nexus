import { describe, it, expect } from 'bun:test'
import * as http from 'node:http'
import { createServer, startServer, stopServer } from './server.js'
import type { ServerConfig } from './server.js'

let nextPort = 32000 + (process.pid % 20000)

function makeConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    port: nextPort++,
    host: 'localhost',
    debug: false,
    maxConnections: 10,
    logDir: './test-logs',
    cors: false,
    ...overrides,
  }
}

async function waitForListening(server: http.Server): Promise<void> {
  if (server.listening) return
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      server.off('error', onError)
      resolve()
    }
    server.once('error', onError)
    server.once('listening', onListening)
  })
}

async function listen(server: http.Server, config: ServerConfig): Promise<number> {
  server.listen(config.port, config.host)
  await waitForListening(server)
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Server did not bind to a TCP port')
  }
  return address.port
}

async function closeServer(server: http.Server): Promise<void> {
  if (!server.listening) return
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })
}

async function requestJson(port: number, pathname: string): Promise<{
  statusCode: number | undefined
  headers: http.IncomingHttpHeaders
  body: Record<string, unknown>
}> {
  return new Promise((resolve, reject) => {
    const request = http.get(`http://localhost:${port}${pathname}`, response => {
      let data = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { data += chunk })
      response.on('end', () => {
        try {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: JSON.parse(data) as Record<string, unknown>,
          })
        } catch (error) {
          reject(error)
        }
      })
    })
    request.once('error', reject)
  })
}

describe('server', () => {
  describe('createServer', () => {
    it('should create a server with valid config', () => {
      const config = makeConfig()
      const server = createServer(config)
      expect(server).toBeInstanceOf(http.Server)
      expect(server.maxConnections).toBe(config.maxConnections)
    })

    it('should throw an error for invalid config', () => {
      const invalidConfig = makeConfig({ port: 99999 })
      expect(() => createServer(invalidConfig)).toThrow('Invalid server configuration')
    })

    it('should handle health check endpoint', async () => {
      const config = makeConfig()
      const server = createServer(config)
      try {
        const port = await listen(server, config)
        const response = await requestJson(port, '/health')
        expect(response.statusCode).toBe(200)
        expect(response.headers['content-type']).toContain('application/json')
        expect(response.body.status).toBe('ok')
        expect(response.body.timestamp).toBeDefined()
      } finally {
        await closeServer(server)
      }
    })

    it('should handle root endpoint', async () => {
      const config = makeConfig()
      const server = createServer(config)
      try {
        const port = await listen(server, config)
        const response = await requestJson(port, '/')
        expect(response.statusCode).toBe(200)
        expect(response.headers['content-type']).toContain('application/json')
        expect(response.body.message).toBe('UR Server is running')
        expect(response.body.version).toBe('1.0.2')
        expect(response.body.port).toBe(port)
        expect(response.body.host).toBe(config.host)
      } finally {
        await closeServer(server)
      }
    })

    it('should return 404 for unknown endpoints', async () => {
      const config = makeConfig()
      const server = createServer(config)
      try {
        const port = await listen(server, config)
        const response = await requestJson(port, '/unknown')
        expect(response.statusCode).toBe(404)
        expect(response.headers['content-type']).toContain('application/json')
        expect(response.body.error).toBe('Not Found')
      } finally {
        await closeServer(server)
      }
    })

    it('should handle CORS when enabled', async () => {
      const config = makeConfig({ cors: true })
      const server = createServer(config)
      try {
        const port = await listen(server, config)
        const response = await requestJson(port, '/health')
        expect(response.statusCode).toBe(200)
        expect(response.headers['access-control-allow-origin']).toBe('*')
        expect(response.headers['access-control-allow-methods']).toBe('GET, POST, PUT, DELETE, OPTIONS')
      } finally {
        await closeServer(server)
      }
    })
  })

  describe('startServer', () => {
    it('should start server with provided config object', async () => {
      const server = startServer(makeConfig())
      try {
        await waitForListening(server)
        expect(server).toBeInstanceOf(http.Server)
        expect(server.listening).toBe(true)
      } finally {
        await closeServer(server)
      }
    })

    it('should start server with another valid config', async () => {
      const server = startServer(makeConfig())
      try {
        await waitForListening(server)
        expect(server).toBeInstanceOf(http.Server)
        expect(server.listening).toBe(true)
      } finally {
        await closeServer(server)
      }
    })
  })

  describe('stopServer', () => {
    it('should stop the server', async () => {
      const config = makeConfig()
      const server = createServer(config)
      await listen(server, config)
      expect(server.listening).toBe(true)

      const closed = new Promise<void>(resolve => server.once('close', () => resolve()))
      stopServer(server)
      await closed

      expect(server.listening).toBe(false)
    })
  })
})
