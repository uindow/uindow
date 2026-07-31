## Uindow - AI browser immune to prompt injections

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

-   **No code** - build automations in the integrated editor and record complex workflows without writing code.
-   **From any AI agent** - Uindow ships a local
    [MCP](https://modelcontextprotocol.io) server, so Claude, Cursor, VS Code, or any
    MCP-compatible assistant can list, create, and run automation agents directly.
    See [Control Uindow from AI agents](#control-uindow-from-ai-agents-mcp).
-   **Write automations in pure JavaScript** - Use the integrated development environment to write, test, and
    debug automations with ease. Auto-completion, code healing, JavaScript parsing, and linting are all built in.

## Running Uindow

### Option 1 - `npx` (recommended)

One command to fetch the CLI and launch the app:

```bash
npx -y @uindow/cli app:start
```

Other lifecycle commands:

```bash
npx @uindow/cli app:status  # check whether the app is running
npx @uindow/cli app:stop    # stop the app
```

### Option 2 - Run locally from source

Clone the repository and launch the app directly from source.

```bash
git clone https://github.com/uindow/uindow.git uindow
cd ./uindow/
npm install
npm start
```

#### What actually runs on your machine

Both options do the same minimal thing: they fetch the **official, signed `Electron`
binary** (only if it isn't already on your machine) and tell Electron to load
`dist/run.js`. That's the whole story - a genuine, trusted, signed Electron runtime
executing code that is clearly visible to you in this repository. Nothing is hidden,
obfuscated, or pulled in behind your back.

### Option 3 - Install prebuilt binaries

Prefer a packaged installer?

We build signed binaries for **macOS, Windows, and Linux** directly from the `dist`
source, and host them on the [Releases](https://github.com/uindow/uindow/releases)
page (current and older versions).

The build tooling lives in this repository and does exactly one job: it archives
the `dist` folder into `app.asar`. You can audit it and reproduce the build yourself.

In order to use the app, create a free account at [Uindow](https://uindow.com/?ref=github)
and follow the on-screen instructions.

## Control Uindow from AI agents (MCP)

Uindow exposes a local [Model Context Protocol](https://modelcontextprotocol.io) server,
so any MCP-compatible assistant can drive web-automation agents directly - no glue code
required. The server speaks **stdio** and is launched on demand by the client:

```bash
npx -y @uindow/cli mcp
```

**Requirements:** Node.js 18+ with `npx` on your `PATH`.

**Tools exposed:** `app_docs`, `app_start`, `app_stop`, `app_status`, `list`, `create`,
`update`, `delete`, `start`, `stop`, `status`, `execute`, `logs`. Call `list` first to
discover agent indexes.

Every client runs the same command - `npx -y @uindow/cli mcp`. Only the config location
and the wrapping key differ.

> **Note:** because Uindow's MCP server is stdio-only, it must be added to a client that
> can spawn local processes. Surfaces that accept remote endpoints only - claude.ai's web
> Connectors, ChatGPT connectors, Warp cloud agents - can't launch it directly. Use a
> desktop or CLI client, or put a Streamable HTTP bridge in front of it.

### Quick reference

| Client | Root key | Where it lives |
| --- | --- | --- |
| Claude Code (CLI + Desktop **Code**) | `mcpServers` | `~/.claude.json` or `.mcp.json` |
| Claude Desktop (**Chat** / **Cowork**) | `mcpServers` | `claude_desktop_config.json` |
| Cursor | `mcpServers` | `.cursor/mcp.json` or `~/.cursor/mcp.json` |
| VS Code (Copilot) | **`servers`** | `.vscode/mcp.json` or user-profile `mcp.json` |
| Windsurf | `mcpServers` | `~/.codeium/windsurf/mcp_config.json` |
| Zed | **`context_servers`** | Zed `settings.json` |
| Codex | **TOML** `[mcp_servers.*]` | `~/.codex/config.toml` or `.codex/config.toml` |
| Gemini CLI | `mcpServers` | `~/.gemini/settings.json` or `.gemini/settings.json` |
| JetBrains AI Assistant | `mcpServers` | Settings dialog (per-project or global) |
| Cline | `mcpServers` | `cline_mcp_settings.json` (open it from the MCP panel) |
| Goose | YAML `extensions:` | `~/.config/goose/config.yaml` |

---

### Claude Code

Claude Code is the recommended path on Anthropic clients - the CLI, the Desktop app's
**Code** tab, and the IDE extensions all read the same configuration.

```bash
claude mcp add uindow -- npx -y @uindow/cli mcp
```

Everything after `--` is passed to the server untouched. By default this registers the
server at **local** scope (this project only, private to you). Add `--scope user` to make
it available in every project, or `--scope project` to write a checked-in `.mcp.json` for
your team:

```bash
claude mcp add uindow --scope user -- npx -y @uindow/cli mcp
```

Verify with `claude mcp list` (shows a health status per server) or `/mcp` inside a
session. Project-scoped servers from `.mcp.json` need one-time approval before they
connect.

### Claude Desktop

The Claude desktop app now ships **Chat**, **Cowork**, and **Code** in a single
application - Claude Code lives in the **Code** tab rather than as a separate download.
That changes where you should configure Uindow:

**For the Code tab**, do nothing extra: Desktop reads the same `~/.claude.json` and
`.mcp.json` files as the CLI, so a `claude mcp add` from your terminal shows up there
automatically. You can also add servers from the UI via the **+** button → **Connectors**
in local and SSH sessions.

**For Chat and Cowork**, use the classic config file. Open **Settings → Developer → Edit
Config** (this creates the file if it doesn't exist), which opens:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

Fully quit and reopen Claude - closing the window isn't enough. Uindow's tools then appear
under the tools menu in the prompt box.

Two things worth knowing about how the two config sources interact:

- Desktop **also** loads `claude_desktop_config.json` into local **Code** tab sessions, so
  a server defined there is available on both surfaces. If the same server name exists in
  both places, the Code tab uses the `claude_desktop_config.json` definition.
- The standalone `claude` CLI does **not** read `claude_desktop_config.json`. On macOS and
  WSL, run `claude mcp add-from-claude-desktop` to copy servers over.

### Cursor

Create `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for every workspace:

```json
{
    "mcpServers": {
        "uindow": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"]
        }
    }
}
```

Then open **Customize** in the sidebar (or Settings → Tools & MCP) and confirm the server
is enabled and its tools are listed. Cursor asks for approval before each MCP tool call by
default; add Uindow's tools to `permissions.json` if you want them to run unattended.

### VS Code (GitHub Copilot)

Run **MCP: Add Server** from the Command Palette, or edit the file directly. Workspace
config is `.vscode/mcp.json`; **MCP: Open User Configuration** opens the profile-wide one
(which syncs via Settings Sync).

Note the root key is `servers`, not `mcpServers` - copying a Cursor or Claude config
verbatim is the single most common mistake here.

```json
{
    "servers": {
        "uindow": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"]
        }
    }
}
```

One-liner equivalent:

```bash
code --add-mcp \
  '{"name":"uindow","type":"stdio","command":"npx","args":["-y","@uindow/cli","mcp"]}'
```

Use **MCP: List Servers** to start, stop, or view server output. On macOS and Linux you
can also add `"sandboxEnabled": true` plus a `sandbox` block to restrict the server's
filesystem and network access - though note that Uindow drives browsers, so an over-tight
sandbox will break it.

### Windsurf

Open the Cascade panel → MCP icon → **Configure** / **View raw config**, which opens:

- **macOS/Linux:** `~/.codeium/windsurf/mcp_config.json`
- **Windows:** `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

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

Press the refresh button in the MCP panel, or fully restart Windsurf. Cascade caps the
number of simultaneously active MCP tools, so disable servers you aren't using if Uindow's
tools don't appear.

### Zed

Zed calls MCP servers *context servers* and uses its own key shape. Open `settings.json`
(`zed: open settings`) - or use **Agent Panel → Add Custom Server** for a guided dialog:

```json
{
    "context_servers": {
        "uindow": {
            "source": "custom",
            "command": "npx",
            "args": ["-y", "@uindow/cli", "mcp"],
            "env": {}
        }
    }
}
```

Zed restarts the context server process on save; no editor restart needed. Project-level
overrides go in `.zed/settings.json`.

### Codex (CLI and IDE extension)

Codex shares one config between the CLI and the IDE extension:

```bash
codex mcp add uindow -- npx -y @uindow/cli mcp
codex mcp list
```

Or edit `~/.codex/config.toml` (global) or `.codex/config.toml` (project - the directory
must be trusted). Note the TOML shape:

```toml
[mcp_servers.uindow]
command = "npx"
args = ["-y", "@uindow/cli", "mcp"]
```

Confirm with `/mcp` inside a Codex session.

### Gemini CLI

```bash
gemini mcp add uindow npx -y @uindow/cli mcp
```

Add `-s user` for a global entry. Equivalent hand-edit of `~/.gemini/settings.json` (or
`.gemini/settings.json` per project):

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

Restart the CLI and run `/mcp` to list the discovered tools.

### JetBrains AI Assistant

Go to **Settings | Tools | AI Assistant | Model Context Protocol (MCP)** and click
**Add**, then paste the JSON. Choose whether the server is global or project-scoped in the
same dialog, and click **Apply** to start it.

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

If you already have Uindow in Claude Desktop, **Import from Claude** pulls the entry
across. Server logs live in the `mcp` folder under **Help → Show Log in Finder/Explorer**.

### Cline

Open the **MCP Servers** icon in the Cline panel → **Configure** → **Configure MCP
Servers**. That opens `cline_mcp_settings.json`, which uses the standard shape:

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

Cline keeps this file separate from VS Code's own `.vscode/mcp.json`; the two don't affect
each other. Open it from the panel rather than by path - the location differs between the
VS Code extension and the Cline CLI.

### Goose

Every Goose extension is an MCP server. Run `goose configure` → **Add Extension** →
**Command-line Extension**, name it `uindow`, and set the command to `npx -y @uindow/cli
mcp`. Goose writes it to `~/.config/goose/config.yaml`:

```yaml
extensions:
    uindow:
        name: uindow
        cmd: npx
        args: ["-y", "@uindow/cli", "mcp"]
        enabled: true
        type: stdio
```

### Any other MCP client

Most remaining clients accept the same object under `mcpServers`:

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

Point the client at the command `npx` with arguments `-y @uindow/cli mcp`.

If your client requires an explicit transport field, use `"type": "stdio"`.

---

### Verifying the connection

Run the launch command by hand first - it's the fastest way to separate "Uindow is broken"
from "the client can't start it":

```bash
npx -y @uindow/cli mcp
```

A stdio server prints nothing and blocks. A silent, hung terminal means it started
correctly; press Ctrl-C and go back to your client. Any stack trace you see here is the
real error your client was swallowing.

### Troubleshooting

**`spawn npx ENOENT` / server never starts in a GUI app.** Desktop apps don't inherit your
shell's `PATH`, which bites anyone using nvm, asdf, or Volta. Run `which npx` (`where npx`
on Windows) and put the absolute path in `command`.

**Config saved, nothing happened.** Most desktop clients only reload MCP config on a full
restart - quit the app entirely (macOS: Cmd+Q; Windows: quit from the tray icon) rather
than closing the window.

**Tools missing after adding the server.** Check the root key against the table above:
`servers` for VS Code, `context_servers` for Zed, `mcp_servers` in TOML for Codex,
`mcpServers` everywhere else. A wrong key is ignored silently in most clients.

**Server connects but tools aren't used.** In Claude Code, MCP tools are deferred behind
tool search by default and loaded on demand, so they may not appear in an upfront tool
list. Ask for a Uindow tool by name, or set `"alwaysLoad": true` on the server entry to
load its tools at session start.

**Where to look next.** `claude mcp list` and `/mcp` (Claude Code), Output panel → MCP
Logs (Cursor), Output → MCP (VS Code), `~/Library/Logs/Claude/mcp*.log` or
`%APPDATA%\Claude\logs\mcp*.log` (Claude Desktop).

## Command-line interface

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

## Creating modules

Most people never open the SDK. There are three ways to build a module - reach for
them in this order:

1. **Record it - zero learning curve.** Open the integrated recorder and use the
   browser exactly as you normally would: point, click, scroll, upload and download
   files. The recorder turns your actions into JavaScript for you - deterministically,
   without any AI, and instantly. What you see is what you get.

2. **Let an AI agent write it - MCP.** Want something more involved? Hand control to
   your local AI agent over MCP and have it author the module on your behalf. Describe
   the outcome and let it produce the code for you. You're always in control of your
   automations, and you can use the included IDE to debug your code.

3. **Write it yourself - SDK.** Ff the recorder and the AI-driven approach both come up
   short, go straight to the source:
    1. Visit the [Uindow SDK Reference](https://uindow.com/docs/?ref=github)
    2. Download the sample module and import it into Uindow
    3. Experiment with the dollar-sign methods - the integrated editor has auto-complete,
       code hints, formatting and linting

For most people the learning curve is zero - the recorder is all you'll ever touch.
And if you decide to go pro, it stays shallow: the SDK is there when you want it, not
before.
