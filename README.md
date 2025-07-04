# Smart Search MCP Server

An MCP server implementation that integrates a remote smart search API, providing powerful web search capabilities.

## Features

-   **Web Search**: Perform web searches with controls for result count, pagination, language, and safety level.
-   **Structured JSON Output**: All search results are returned in a clean JSON format.
-   **Easy Integration**: Designed for seamless use with any MCP-compatible client.

## Tools

### `smart_search`

Executes a web search with filtering and pagination options.

**Inputs:**

-   `query` (string): The search terms.
-   `count` (number, optional): The number of results to return (default: 10).

## Configuration

### Getting an API Key

1.  Sign up for an account with the search API provider.
2.  Generate your API key. The key should be in the format `endpoint-apikey`.

### Environment Variable

This server requires the `SERVER_KEY` environment variable to be set to your API key.

## Usage with an MCP Client

To use this server with a client like OpenWebUI or Claude Desktop, add the following configuration. This example uses `npx` to run the server directly from the npm registry.

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```


## Installation

### Installing via Smithery

To install SmartSearch Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@pgzhang/smartsearch-mcp):

```bash
npx -y @smithery/cli install @pgzhang/smartsearch-mcp --client claude
```

To use with Claude Desktop, add the server config with your Google API credentials:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`


```json
{
  "mcpServers": {
    "smart-search": {
      "command": "npx",
      "args": [
        "-y",
        "@pgzhang/smartsearch-mcp"
      ],
      "env": {
        "AK": "YOUR_API_KEY_HERE",
        "ENDPOINT": "YOUR_ENDPOINT_HERE"
      }
    }
  }
}
```
## Usage

### Search Tool
```json
{
  "name": "search",
  "arguments": {
    "query": "your search query",
    "count": 5  // optional, default is 10, max is 50
  }
}
```
## License

This MCP server is released under the MIT License. See the LICENSE file for more details.
