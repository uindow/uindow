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
-   **From any AI assistants** - Uindow ships a local
    [MCP](https://modelcontextprotocol.io) server, so Claude, Cursor, VS Code, or any
    MCP-compatible client can list, create, and run automation modules directly.
    See [Control Uindow from AI assistants](#control-uindow-from-ai-assistents-mcp).
-   **Write automations in pure JavaScript** - Use the integrated development environment to write, test, and
    debug automations with ease. Auto-completion, code healing, JavaScript parsing, and linting are all built in.

## Running Uindow

In order to use the app, create an account for free at [uindow.com](https://uindow.com/?ref=github)
and follow the on-screen instructions.

### Option 1 - Prebuilt binaries (recommended)

We build signed binaries for **macOS, Windows, and Linux** directly from the `dist`
source, and host them on the [GitHub Releases](https://github.com/uindow/uindow/releases)
page (current and older versions) and on the [Uindow install page](https://uindow.com/install/).

### Option 2 - `npx`

One command to fetch the CLI and launch the app:

```bash
npx -y @uindow/cli@latest app:start
```

Other lifecycle commands:

```bash
npx @uindow/cli app:status  # check whether the app is running
npx @uindow/cli app:stop    # stop the app
```

### Option 3 - Run from source

Clone the repository and launch the app directly from source.

```bash
git clone https://github.com/uindow/uindow.git uindow
cd ./uindow/
npm install
npm start
```

## Control Uindow from AI assistents (MCP)

Uindow exposes a local [Model Context Protocol](https://modelcontextprotocol.io) server,
so any MCP-compatible client can drive web-automation agents directly. 
The server communicates over **stdio** securely and is launched on demand by the AI assistant.

**Requirements:** Node.js 18+ with `npx` on your `PATH`.

```bash
npx -y @uindow/cli@latest mcp
```

### Quick reference

Uindow provides a 1-click connector for the most popular AI assistants.

> Go to **Uindow** > **AI assistants** > **Connect**

| AI assistant | Instant connect | Root key | Config location |
| --- | --- | --- | --- |
| Claude Code (CLI + Desktop **Code**) | ✅ yes | `mcpServers` | `~/.claude.json` |
| Claude Desktop (**Chat** / **Cowork**) | ✅ yes | `mcpServers` | `claude_desktop_config.json` |
| Cursor | ✅ yes | `mcpServers` | `~/.cursor/mcp.json` |
| VS Code (Copilot) | ✅ yes | `servers` | `mcp.json` (**MCP: Open User Configuration**) |
| Windsurf | ✅ yes | `mcpServers` | `~/.codeium/windsurf/mcp_config.json` |
| Zed | ✅ yes | `context_servers` | `settings.json` |
| Codex | ✅ yes | **TOML** `[mcp_servers.*]` | `~/.codex/config.toml` |
| Gemini CLI | ✅ yes | `mcpServers` | `~/.gemini/settings.json` |
| Cline | ✅ yes | `mcpServers` | `cline_mcp_settings.json`  |
| Goose | ✅ yes | **YAML** `extensions` | `~/.config/goose/config.yaml` |

---

### JetBrains AI Assistant

Go to **Settings > Tools > AI Assistant > Model Context Protocol (MCP)** and click
**Add**, then paste the JSON. In the same dialog, set the scope to **Global** rather than
project-scoped so the server is available in every project you open, then click **Apply**
to start it.

```json
{
    "mcpServers": {
        "uindow": {
            "command": "npx",
            "args": ["-y", "@uindow/cli@latest", "mcp"]
        }
    }
}
```

### Any other AI Assistant

Most remaining AI assistants accept the same object under `mcpServers`. Look for the config file
in your home directory (`~/.<client>/...`) rather than the one in your project root - the
home-directory copy is the global one:

```json
{
    "mcpServers": {
        "uindow": {
            "command": "npx",
            "args": ["-y", "@uindow/cli@latest", "mcp"]
        }
    }
}
```

Point the AI assistant at the command `npx` with arguments `-y @uindow/cli@latest mcp`.

If your AI assistant requires an explicit transport field, use `"type": "stdio"`.

### Verifying the connection

Run the launch command by hand first - it's the fastest way to separate "Uindow is broken"
from "the AI assistant can't start it":

```bash
npx -y @uindow/cli@latest mcp
```

A stdio server prints nothing and blocks. A silent, hung terminal means it started
correctly; press Ctrl-C and go back to your AI assistant. Any stack trace you see here is the
real error your AI assistant was swallowing.

Then confirm the scope took: open the AI assistant from a **different** directory than the one
you configured it in, and check that Uindow's tools are still listed. If they vanish, the
entry landed in a project-local config.

#### Troubleshooting

* **Server works in one project but not another.**
  * Classic scope problem - the entry is
  project-local. In Claude Code, `claude mcp list` from the other directory will come up
  empty; re-add with `--scope user`. In Gemini CLI, re-add with `-s user`. In Cursor and VS
  Code, move the entry from `.cursor/mcp.json` or `.vscode/mcp.json` to `~/.cursor/mcp.json`
  or the user-profile `mcp.json`.

* **`spawn npx ENOENT` / server never starts in a GUI app.** 
  * Desktop apps don't inherit your
  shell's `PATH`, which bites anyone using nvm, asdf, or Volta. Run `which npx` (`where npx`
  on Windows) and put the absolute path in `command`.

* **Config saved, nothing happened.** 
  * Most desktop AI assistants only reload MCP config on a full
  restart - quit the app entirely (macOS: Cmd+Q; Windows: quit from the tray icon) rather
  than closing the window.

* **Tools missing after adding the server.** 
  * Check the root key against the table above:
  `servers` for VS Code, `context_servers` for Zed, `mcp_servers` in TOML for Codex,
  `mcpServers` everywhere else. A wrong key is ignored silently in most AI assistants.

* **Duplicate or shadowed entries.** 
  * Several AI assistants resolve project config ahead of global
  config, so an old project-local `uindow` entry will silently win over the new global one.
  Delete the stale entry rather than editing both.

* **Server connects but tools aren't used.** 
  * In Claude Code, MCP tools are deferred behind
  tool search by default and loaded on demand, so they may not appear in an upfront tool
  list. Ask for a Uindow tool by name, or set `"alwaysLoad": true` on the server entry to
  load its tools at session start.

* **Where to look next.** 
  * `claude mcp list` and `/mcp` (Claude Code), Output panel > MCP
  Logs (Cursor), Output > MCP (VS Code), `~/Library/Logs/Claude/mcp*.log` or
  `%APPDATA%\Claude\logs\mcp*.log` (Claude Desktop).


## Command-line interface

You can run Uindow from any CI/CD pipeline or command-line interface.

```bash
npx -y @uindow/cli@latest --help
```

Alternatively, you can use `node dist/bin.js --help` instead of `npx @uindow/cli --help`
for a faster response.

```
  USAGE
    $ npx @uindow/cli <command> [options]

  AVAILABLE COMMANDS
    $ npx @uindow/cli mcp                     Uindow MCP server (stdio) 
    $ npx @uindow/cli app_docs                Query SDK documentation 
    $ npx @uindow/cli app_status              Get application status 
    $ npx @uindow/cli app_start               Start application 
    $ npx @uindow/cli app_stop                Stop application 
    $ npx @uindow/cli agent_list              List agents 
    $ npx @uindow/cli agent_create            Create agent 
    $ npx @uindow/cli agent_update            Update agent 
    $ npx @uindow/cli agent_delete            Delete agent 
    $ npx @uindow/cli agent_status            Get agent status 
    $ npx @uindow/cli agent_start             Start agent 
    $ npx @uindow/cli agent_stop              Stop agent 
    $ npx @uindow/cli agent_screenshot        Grab agent screenshot 
    $ npx @uindow/cli agent_viewport          Scan agent viewport 
    $ npx @uindow/cli agent_execute           Execute code in an agent 
    $ npx @uindow/cli agent_logs              Get agent logs 
    $ npx @uindow/cli agent_settings_get      Get settings 
    $ npx @uindow/cli agent_settings_set      Update settings 
    $ npx @uindow/cli agent_results_get       Get latest results 
    $ npx @uindow/cli src_sample              Module: get sample (yaml) 
    $ npx @uindow/cli src_export              Module: get source (yaml) 
    $ npx @uindow/cli src_code_get            Module: get state or function code 
    $ npx @uindow/cli src_code_set            Module: set state or function code 
    $ npx @uindow/cli src_keys_list           Module: list item keys 
    $ npx @uindow/cli src_keys_reorder        Module: reorder item keys 
    $ npx @uindow/cli src_keys_update         Module: update item key 
    $ npx @uindow/cli src_keys_delete         Module: delete item 
    $ npx @uindow/cli src_input_get           Module: get input 
    $ npx @uindow/cli src_input_set_bool      Module: set boolean input 
    $ npx @uindow/cli src_input_set_int       Module: set integer input 
    $ npx @uindow/cli src_input_set_string    Module: set string input 
    $ npx @uindow/cli src_input_set_files     Module: set files input 
    $ npx @uindow/cli src_input_set_table     Module: set table input 
    $ npx @uindow/cli src_output_get          Module: get output 
    $ npx @uindow/cli src_output_set_bool     Module: set boolean output 
    $ npx @uindow/cli src_output_set_int      Module: set integer output 
    $ npx @uindow/cli src_output_set_string   Module: set string output 
    $ npx @uindow/cli src_output_set_files    Module: set files output 
    $ npx @uindow/cli src_output_set_table    Module: set table output 

  OPTIONS
    --help      Help menu for a specific command 
    --version   Package version 
```

## Creating modules

There are three ways to build a module - reach for them in this order:

1. **Record it - zero learning curve.** Open the integrated recorder and use the
   browser exactly as you normally would: point, click, scroll, upload and download
   files. The recorder turns your actions into JavaScript for you - deterministically,
   without any AI, and instantly. What you see is what you get.

2. **Let an AI assistant write it via MCP.** Want something more involved? Hand control to
   your local AI assistant over MCP and have it author the module on your behalf. Describe
   the outcome and let it produce the code for you. You're always in control of your
   automations, and you can use the included IDE to debug your code.

3. **Write it yourself in plain JavaScript.** If the recorder and the AI-driven approach 
   both come up short, go straight to the source:
    1. Visit the [Uindow SDK Reference](https://uindow.com/docs/)
    2. Download the sample module and import it into Uindow
    3. Experiment with the dollar-sign methods - the integrated editor has auto-complete,
       code hints, formatting and linting

For most people the learning curve is zero - the recorder is all you'll ever touch.
And if you decide to go pro, it stays shallow: the SDK is there when you want it, not
before.
