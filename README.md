## Uindow - UI testing and web automation with trusted interactions

<p align="center">
    <a href="https://uindow.com/?ref=github">
        <img src="https://uindow.github.io/img/github-banner.png"/>
    </a>
</p>

### Installation

#### Command-line interface

You can run Uindow from any CI/CD pipeline or command-line interface.

```bash
npm install @uindow/cli
npx uindow --help
```

Alternatively, you can use `node ./node_modules/uindow/dist/bin.js --help` instead of `npx uindow --help` for a faster response.

```
  USAGE
    $ npx uindow <command> [options]

  AVAILABLE COMMANDS
    $ npx uindow mcp          Run MCP server
    $ npx uindow app:start    Start application
    $ npx uindow app:stop     Stop application
    $ npx uindow app:status   Check application status
    $ npx uindow list         List agents
    $ npx uindow create       Create agent
    $ npx uindow update       Update agent
    $ npx uindow delete       Delete agent
    $ npx uindow start        Start agent
    $ npx uindow stop         Stop agent
    $ npx uindow tail         Monitor agent logs

  OPTIONS
    --help      Help menu for a specific command
    --version   Package version
```

All commands that specify the `@return` tag in their description return valid JSON-formatted values.

### Model Context Protocol server

Control [Uindow](https://uindow.com) web-automation agents from any MCP-compatible
assistant. The server runs locally over stdio and is launched on demand with `npx`.

Tools exposed: `app_status`, `app_start`, `app_stop`, `list`, `create`, `update`,
`delete`, `start`, `stop`. Call `list` first to discover agent indexes.

#### Install

All clients use the same launch command — `npx -y @uindow/cli mcp` — only the file
location and the wrapping key differ.

#### Claude Desktop

Edit `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
    "mcpServers": {
        "uindow": {
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"]
        }
    }
}
```

Restart Claude Desktop. The Uindow tools appear under the tools (🔌) menu.

#### Claude Code

```bash
claude mcp add uindow -- npx -y @uindow/cli mcp
```

#### Cursor

Edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project) — same shape
as Claude Desktop:

```json
{
    "mcpServers": {
        "uindow": {
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"]
        }
    }
}
```

#### VS Code

Create `.vscode/mcp.json` in your workspace (or run **MCP: Open User Configuration**
for a global setup). Note the root key here is `servers`, not `mcpServers`:

```json
{
    "servers": {
        "uindow": {
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"]
        }
    }
}
```

#### Other clients

Any client that speaks MCP over stdio works. Point it at the command `npx` with
arguments `-y @uindow/cli mcp`.

#### ✨ Latest release

Create an account at [Uindow](https://uindow.com/?ref=github) and follow the on-screen instructions.

#### 📦 Older release

To install an older version, visit the [Releases](https://github.com/uindow/uindow/releases) page and download the appropriate installer.

#### 🌙 Nightly build

To run the latest (unreleased) version of Uindow, **clone this repository** and run the following commands:

```bash
git clone https://github.com/uindow/uindow.git uindow
cd uindow
npm install
npm start
```

### Creating modules

Building Uindow modules is easy:

1. Visit the [Uindow SDK Reference](https://uindow.com/docs/?ref=github)
2. Download the sample module and import it into Uindow
3. Start experimenting with dollar-sign methods - the integrated editor features auto-complete and code hints
