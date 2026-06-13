## Uindow - Real browser automation for AI agents

<p align="center">
    <a href="https://uindow.com/?ref=github">
        <img src="https://uindow.github.io/img/github-banner.png"/>
    </a>
</p>

Uindow drives a **real, signed Chromium/Electron browser** with genuine OS-level
input - actual cursor movement, real keystrokes, and native file dialogs rather
than synthetic page events. It runs entirely on your own machine and your own
network, and every line of code it executes sits in plain sight in this repository.

Automate it three ways:

- **No code** - build automations in the integrated editor and record complex workflows without writing code.
- **From any AI agent** - Uindow ships a local
  [MCP](https://modelcontextprotocol.io) server, so Claude, Cursor, VS Code, or any
  MCP-compatible assistant can list, create, and run automation agents directly.
  See [Control Uindow from AI agents](#control-uindow-from-ai-agents-mcp).
- **From the command line** - script it into any CI/CD pipeline.

### Running Uindow

#### Option 1 - `npx` (recommended)

One command to fetch the CLI and launch the app:

```bash
npx -y @uindow/cli app:start
```

Other lifecycle commands:

```bash
npx -y @uindow/cli app:status   # check whether the app is running
npx -y @uindow/cli app:stop     # stop the app
```

#### Option 2 - Run locally from source

Clone the repository and start it directly.

```bash
git clone https://github.com/uindow/uindow.git uindow
cd ./uindow/
npm install
npm start
```

#### What actually runs on your machine

Both options do the same minimal thing: they fetch the **official, signed `electron`
binary** (only if it isn't already on your machine) and tell Electron to load
`dist/run.js`. That's the whole story - a genuine, trusted, signed Electron runtime
executing code that is clearly visible to you in this repository. Nothing is hidden,
obfuscated, or pulled in behind your back.

#### Prebuilt binaries

Prefer a packaged installer? We build signed binaries for **macOS, Windows, and
Linux** directly from the `dist` source, and host them on the
[Releases](https://github.com/uindow/uindow/releases) page (current and older
versions). The build tooling lives in this repository and does exactly one job: it
archives the `dist` folder into `app.asar`. You can audit it and reproduce the build
yourself.

In order to use the app, create a free account at [Uindow](https://uindow.com/?ref=github) and
follow the on-screen instructions.

### Control Uindow from AI agents (MCP)

Uindow exposes a local [Model Context Protocol](https://modelcontextprotocol.io)
server so any MCP-compatible assistant can drive web-automation agents directly - no
glue code required. The server runs locally over stdio and is launched on demand
with `npx`:

```bash
npx -y @uindow/cli mcp
```

**Tools exposed:** `app_docs`, `app_start`, `app_stop`, `app_status`, `list`,
`create`, `update`, `delete`, `start`, `stop`, `status`, `execute`, `logs`.

Call `list` first to discover agent indexes.

All clients use the same launch command - `npx -y @uindow/cli mcp` - only the file
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

Edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project) - same shape
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

### Command-line interface

You can run Uindow from any CI/CD pipeline or command-line interface.

```bash
npx -y @uindow/cli --help
```

Alternatively, you can use `node dist/bin.js --help` instead of `npx @uindow/cli --help` 
for a faster response.

```
  USAGE
    $ npx @uindow/cli <command> [options]

  AVAILABLE COMMANDS
    $ npx @uindow/cli mcp          Run MCP server
    $ npx @uindow/cli app:docs     Fetch SDK documentation
    $ npx @uindow/cli app:start    Start application
    $ npx @uindow/cli app:stop     Stop application
    $ npx @uindow/cli app:status   Check application status
    $ npx @uindow/cli list         List agents
    $ npx @uindow/cli create       Create agent
    $ npx @uindow/cli update       Update agent
    $ npx @uindow/cli delete       Delete agent
    $ npx @uindow/cli start        Start agent
    $ npx @uindow/cli stop         Stop agent
    $ npx @uindow/cli status       Check agent status
    $ npx @uindow/cli execute      Execute code in agent
    $ npx @uindow/cli logs         Fetch agent logs

  OPTIONS
    --help      Help menu for a specific command
    --version   Package version
```

All commands that specify the `@return` tag in their description return valid
JSON-formatted values.

### Creating modules

Most people never open the SDK. There are three ways to build a module - reach for
them in this order:

1. **Record it - zero learning curve.** Open the integrated recorder and use the
   browser exactly as you normally would: point, click, scroll, upload and download
   files. The recorder turns your actions into JavaScript for you - deterministically,
   without any AI, and instantly. What you see is what you get.

2. **Let an AI agent write it - MCP.** Want something more involved? Hand control to
   your local AI agent over MCP and have it author the module on your behalf. Describe
   the outcome and let it produce the code for you.

3. **Write it yourself - SDK.** Only if the recorder and the AI-driven approach both
   come up short, go straight to the source:
   1. Visit the [Uindow SDK Reference](https://uindow.com/docs/?ref=github)
   2. Download the sample module and import it into Uindow
   3. Experiment with the dollar-sign methods - the integrated editor has auto-complete,
      code hints, formatting and linting

For most people the learning curve is zero - the recorder is all you'll ever touch.
And if you decide to go pro, it stays shallow: the SDK is there when you want it, not
before.
