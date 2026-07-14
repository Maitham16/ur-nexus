import * as http from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { loadConfig, validateConfig, ServerConfig } from './config.js'

// Server instance type
export type ServerInstance = http.Server

/**
 * Creates and starts an HTTP server with the provided configuration
 * @param config The server configuration
 * @returns The HTTP server instance
 */
export function createServer(config: ServerConfig): ServerInstance {
  // Validate configuration
  const validationErrors = validateConfig(config)
  if (validationErrors.length > 0) {
    throw new Error(`Invalid server configuration: ${validationErrors.join(', ')}`)
  }

  // Create the HTTP server
  const server = http.createServer((req, res) => {
    // Set CORS headers if enabled
    if (config.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }
    }

    // Add debug logging if enabled
    if (config.debug) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    }

    // Simple routing
    if (req.url === '/health' && req.method === 'GET') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
    } else if (req.url === '/' && req.method === 'GET') {
      // Root endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const address = server.address()
      const activePort = address && typeof address !== 'string' ? address.port : config.port
      res.end(JSON.stringify({
        message: 'UR Server is running',
        version: '1.0.3',
        port: activePort,
        host: config.host
      }))
    } else {
      // 404 for all other routes
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not Found' }))
    }
  })

  // Set max connections
  server.maxConnections = config.maxConnections

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err)
  })

  // Handle client errors
  server.on('clientError', (err, socket) => {
    console.error('Client error:', err)
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })

  return server
}

/**
 * Starts the server with the provided configuration
 * @param config Optional server configuration or path to config file
 * @returns The HTTP server instance
 */
export function startServer(config?: ServerConfig | string): ServerInstance {
  let serverConfig: ServerConfig

  if (typeof config === 'string') {
    // If config is a string, treat it as a path to config file
    serverConfig = loadConfig(config)
  } else if (config) {
    // If config is provided as an object, use it
    serverConfig = config
  } else {
    // Otherwise, load config from default locations
    serverConfig = loadConfig()
  }

  // Create and start the server
  const server = createServer(serverConfig)

  // Start listening
  server.listen(serverConfig.port, serverConfig.host, () => {
    const address = server.address()
    const activePort = address && typeof address !== 'string' ? address.port : serverConfig.port
    console.log(`Server running at http://${serverConfig.host}:${activePort}/`)
    if (serverConfig.debug) {
      console.log('Debug mode enabled')
    }
  })

  return server
}

/**
 * Stops the server gracefully
 * @param server The server instance to stop
 */
export function stopServer(server: ServerInstance): void {
  server.close(() => {
    console.log('Server stopped')
  })

  // Force close after 5 seconds if server hasn't stopped gracefully
  const forceCloseTimer = setTimeout(() => {
    server.closeAllConnections()
  }, 5000)
  forceCloseTimer.unref()
}

// Export types
export type { ServerConfig } from './config.js'
