- [ ] New videos for front page, including one with the recorder

## CLI

- [ ] CLI
- [ ] start: either w/ UI OR headless
- [ ] stop, restart, status
- [ ] agents: list, status, start (w/ source & inputs), stop

## SCE

- [ ] #1. Replace "Don't forget to create a file output" toast with direct action (follow @todos)
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


## Value

- [ ] array for string/int (custom csv values)
- [ ] settings / inputs: show icon for string/int

- [ ] Scheduled/Recurring - array of runs
 - [ ] Allow copying to/from manual run

- [ ] export results (manual & auto)

- [ ] results in reverse
	- runs
	- tables
	- files

- [ ] UI: agent resolution in browser bar
  - [ ] $.doResolution()
  - [ ] set per agent
  - [ ] store in target.metadata
- [ ] UI: nav stop
- [ ] app -> when paused, dialog takes to browser tab

## Details

- [ ] re-check all modules
- [ ] Restore the 2 modules

- [ ]	module: add author
- [ ] WEB: ui/modules - move version selector to dialog
- [ ] Organization (attached to userid)
  - [ ] API + tests
  - [ ] Web
  - [ ] App: DialogWorkspace

- [ ] $.doClearCache(domain)
- [ ] add tests for
  - [ ] $.doGetMouse
  - [ ] $.doGetStyle
  - [ ] $.doGetScrollable
  - [ ] $.osFileGetUrl
  - [ ] $.osFileGetSize

Web

- [ ] Set canonical to current page
- [ ] Set description to 160 chars max.

## Chores
- [ ] improve GC
- [ ] save the procedure on how to update models.tgz
  	
	rclone sync "C:\Users\YourName\Documents\MyFolder" r2:your-bucket-name/path
	rclone sync . r2:oglama/ --progress --dry-run

- [ ] vs pages: puppeteer, AI browsers
- [ ] Recorder: handle extra input types with (new) $.doSetValue, and custom dialog for all
  <input type="color">
  <input type="range">

  <input type="time">
  <input type="week">
  <input type="month">
  <input type="date">
  <input type="datetime-local">