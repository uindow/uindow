
## MVP

- [ ] CSS selector tool - point and click
- [ ] record at cursor
  - [ ] right click for: click, double-click, wait for element
- [ ]	module
  - [ ] tooltip should include title
  - [ ] label v. should not be trimmed
  - [ ] add author to module
- [ ] WEB: ui/modules - move version selector to dialog
- [ ] move source button to front; change tutorial for pop on "Source code"

## UX

- [ ] array for string/int (as csv input)
- [ ] Scheduled/Recurring - array of runs
 - [ ] Allow copying to/from manual run
- [ ] export results (manual & auto)
- [ ] results in reverse
	- runs
	- tables
	- files

## CLI

- [ ] CLI
- [ ] start: either w/ UI OR headless
- [ ] stop, restart, status
- [ ] agents: list, status, start (w/ source & inputs), stop

## UX+

- [ ] UI: agent resolution in browser bar
  - [ ] $.doResolution()
  - [ ] set per agent
  - [ ] store in target.metadata
- [ ] UI: nav stop
- [ ] longer logs
- [ ] app -> when paused, dialog takes to browser tab

--- (SCE)
- [ ] preference/runs: auto-clean after 30 (configurable) days
- [ ] Show confirm dialog
- [ ] when installing module over modified source
- [ ] when switching to new version
- [ ] when deleting module - inform that source code will remain unchanged
- [ ] Add info to HashTabs; describe Scheduled runs have higher priority than recurring runs
- [ ] SCE: make sure to search through description as well
  - [ ] add "cache" keyword to global* methods descriptions
  - [ ] add "fetch" keyword to request* methods descriptions
- [ ] SCE: F2/Ctrl+R should allow rename
- [ ] SCE: tooltips should appear above if cut out
- [ ] SCE: bug - when switching version, the new one does not reload in visible editors!!!
- [ ] SCE: bug - boolean should not be orange if used as dependency!
- [ ] SCE: make sure io* are strings
- [ ] SCE: error if io* are not found (check for type)
- [ ] SCE: suggest fix (input, output when not found)
- [ ] SCE: when renaming IO, function, state, update references in code
- [ ] SCE: bug - last selected IO element not properly highlighted in sidebar
- [ ] SCE: input format: "user selects an array of strings" > should be "integers" for input type integer
- [ ] SCE: Environment tab
- [ ] SCE: button to discard changes in (*) dialog if some version installed (re-install current version w/ confirmation)

## Details

### Web
- [ ] Set canonical to current page
- [ ] Set description to 160 chars max.

App
- [ ] $.doClearCache(domain)
- [ ] add tests for
  - [ ] $.doGetMouse
  - [ ] $.doGetStyle
  - [ ] $.doGetScrollable
  - [ ] $.osFileGetUrl
  - [ ] $.osFileGetSize

## Chores
- [ ] improve GC
- [ ] save the procedure on how to update models.tgz
  	
	rclone sync "C:\Users\YourName\Documents\MyFolder" r2:your-bucket-name/path
	rclone sync . r2:oglama/ --progress --dry-run

- [ ] vs pages: puppeteer, AI browsers