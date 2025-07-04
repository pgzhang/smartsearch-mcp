#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const AK = process.env.AK;
const ENDPOINT = process.env.ENDPOINT;

if (!AK) {
  throw new Error('TOKEN environment variable is required');
}

if (!ENDPOINT) {
  throw new Error('ENDPOINT environment variable is required');
}


interface SearchResult {
  name: string;
  url: string;
  snippet: string;
}

interface WebpageContent {
  title: string;
  text: string;
  url: string;
}

const isValidSearchArgs = (
  args: any
): args is { query: string; count?: number } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.query === 'string' &&
  (args.num === undefined || typeof args.num === 'number');

const isValidWebpageArgs = (
  args: any
): args is { url: string } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.url === 'string';

class SearchServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'search-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: `https://searchapi.xiaosuai.com/search/${ENDPOINT}/smart`,
      headers: {
        'Authorization': `Bearer ${AK}`,
        'Content-Type': 'application/json',
        'Pargma': 'no-cache',
    },
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search',
          description: 'Perform a web search query',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              count: {
                type: 'number',
                description: 'Number of results (1-10)',
                minimum: 1,
                maximum: 50,
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'search') {
        if (!isValidSearchArgs(request.params.arguments)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid search arguments'
          );
        }

        const { query, num = 5 } = request.params.arguments;

        try {
          const response = await this.axiosInstance.get('', {
            params: {
              q: query,
              count: Math.min(num, 50),
            },
          });

          const results: SearchResult[] = response.data.items.map((item: any) => ({
            name: item.name,
            url: item.url,
            snippet: item.snippet,
          }));

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Search API error: ${
                    error.response?.data?.error?.message ?? error.message
                  }`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      } 

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Search MCP server running on stdio');
  }
}

const server = new SearchServer();
server.run().catch(console.error);
