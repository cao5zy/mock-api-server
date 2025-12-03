
# Mock API Server

A simple mock API server that returns configured responses or default data.

## Installation

Install globally to use as a CLI tool:

```bash
npm install -g mock-api-server
```

Or install locally in your project:

```bash
npm install mock-api-server
```

## Usage

### Global Installation

After global installation, you can run the server from anywhere:

```bash
# Start with default configuration
mock-api-server

# Specify custom configuration file
mock-api-server --config ./path/to/your/config.json
mock-api-server -c ./path/to/your/config.json

# Use environment variables
MOCK_CONFIG=./config/custom.json PORT=8080 mock-api-server
```

### Local Installation

If installed locally, you can run it via npx:

```bash
npx mock-api-server --config ./config/mock-config.json
```

Or add it to your package.json scripts:

```json
{
  "scripts": {
    "mock-server": "mock-api-server --config ./config/mock-config.json"
  }
}
```

## Configuration

Create a configuration file (default: `./config/mock-config.json`) with your mock endpoints and responses.

Example configuration:
```json
{
  "endpoints": {
    "/api/users": {
      "GET": {
        "response": {
          "users": [
            {"id": 1, "name": "John Doe"},
            {"id": 2, "name": "Jane Smith"}
          ]
        },
        "status": 200
      }
    }
  },
  "defaultResponse": {
    "data": {
      "message": "This is a mock response"
    }
  }
}
```

## Features

- Dynamic route matching based on your configuration
- Automatic reload when configuration file changes
- CORS enabled by default
- Support for JSON and URL-encoded request bodies
- Graceful shutdown on SIGINT/SIGTERM

## Development

To run during development:

```bash
npm run dev
```
