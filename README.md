# Dummy REST API

A simple mock API server that returns configured responses or default data .

## Installation

Install globally to use as a CLI tool:

```bash
npm install -g dummy-rest-api
```

Or install locally in your project:

```bash
npm install dummy-rest-api
```

## Usage

### Global Installation

After global installation, you can run the server from anywhere:

```bash
# Start with default configuration
dummy-rest-api

# Specify custom configuration file
dummy-rest-api --config ./path/to/your/config.json
dummy-rest-api -c ./path/to/your/config.json

# Use environment variables
MOCK_CONFIG=./config/custom.json PORT=8080 dummy-rest-api
```

### Local Installation

If installed locally, you can run it via npx:

```bash
npx dummy-rest-api --config ./config/mock-config.json
```

Or add it to your package.json scripts:

```json
{
  "scripts": {
    "mock-server": "dummy-rest-api --config ./config/mock-config.json"
  }
}
```

## Configuration

Create a configuration file (default: `./config/mock-config.json`) with your mock endpoints and responses.

Example configuration:
```json
{
  "get:api/user": {
    "data": {
      "name": "xxa",
      "id": 1,
      "email": "xxa@example.com"
    }
  },
  "default": {
    "data": {
      "status": "ok"
    }
  }
}
```
**The `default` key defines the response for any unconfigured endpoint**

## Features

- Dynamic route matching based on your configuration  
- Returns default response from the `default` configuration for any unconfigured URL
- Graceful shutdown on SIGINT/SIGTERM


## Development

To run during development:

```bash
npm run dev
```
