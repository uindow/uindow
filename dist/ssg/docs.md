---
title: Uindow SDK
description: Welcome to the Uindow SDK Documentation.
---

### Founding principles

Defined by the Roman architect Vitruvius, the principles of Strength, Utility, and Delight (firmitas, utilitas, venustas) form the foundation of good architecture, and they are central to Uindow's philosophy.

#### Firmitas

Uindow opens the door to automations that are simply not possible with other software. It maintains a good balance between AI flexibility and JavaScript programming determinism, all while protecting your privacy.

#### Utilitas

Effortlessly install, run, and edit modules directly from the built-in source code editor. The editor supports all the methods and properties listed below, and comes with autocomplete, auto-formatting, and linting.

#### Venustas

Uindow is designed with simplicity at its core. You don't need to be a programmer to get value from this software. Just search our repository for a module that solves your problem, install it, run it, and modify it to your liking.

* * *

### Getting started

Uindow is a desktop application built on top of Chromium that allows you to automate web actions.

[Create an account] and download the latest version to get started.

#### 1\. Agents

Agents are autonomous browser windows, each operating in its own isolated session. For security reasons, agents do not have direct access to the file system or to each other's data. You must manually specify input files as needed.

#### 2\. Modules

Agents execute small JavaScript programs called modules. Each module defines inputs, outputs, functions, and a finite-state machine. For security reasons, modules do not have direct access to the browser window. Instead, the dollar sign object (`$`) is used to interact with the web page, pause execution, chat with a locally running large language model, fetch user input, save results, and more.

##### 2.1. Finite-state machine

Complex browser interactions are best modeled as a finite-state machine.

*   When a user starts an agent, the state machine begins execution from the entry state.
    
*   It then jumps from state to state with `return { next: "state-key" }`
    
*   The state machine stops if an error occurs or if no next state is specified.
    

##### 2.2. Functions

Functions are used to avoid code duplication within state machine states. Unlike states, a function's return value has no special significance. Functions can be called from either a state or another function using [$.fn("function-key")]

##### 2.3. Inputs and outputs

Each module can define up to 128 inputs and 128 outputs.

Supported input and output types are: `integer`, `string`, `boolean`,`table` and `files`

*   Inputs for each run are specified in the Settings tab. Fetch inputs in states and functions with [$.ioInput\*()]
    
*   Outputs are collected in the Results tab. Store outputs in states and functions with [$.ioOutput\*()]
    

#### 3\. Collaboration

You can publish your modules to the module repository, allowing others to install and use your work. You can also import and export your automations as `.js.yaml` files, giving you complete privacy and control over your work.

* * *

* * *

### Example

Here is an example of a small Uindow module (`search.js.yaml`) that performs a Google search.

Please note that the module is exported as a YAML file, but each function and finite-state machine state is written in pure JavaScript and relies on the dollar sign object (`$`) for operations.

**search.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.fn("visit-google");
      await $.fn("search");
srcFunctions:
  - key: visit-google
    code: |
      // Navigate to Google and wait for page to load
      await $.navLoad("https://uindow.com/");
  - key: search
    code: |
      // Find the input field
      const inputKey = await $.doQuery("[name='q']");
      if ("string" !== typeof inputKey) {
        throw new Error("Could not find input field");
      }

      // Get search term from user settings
      const searchTerm = $.ioInputString("search-term");

      // Replace previous string and send enter key
      await $.doType(inputKey, searchTerm, { replace: true, submit: true });
srcInputs:
  - key: search-term
    type: string
    name: Search term
    desc: A search term for Google
    max: 1024
    options: []
    default: uindow
srcOutputs: []
```

Import this and other modules by following these steps:

*   Launch Uindow, select agent, source codesource control, import from YAML
*   Choose file ( `search.js.yaml` )

* * *

### The SDK

> All available Uindow SDK methods and properties are described below. The SDK has a flat structure, with every method and property attached to the dollar sign object (`$`).

* * *

#### $.args

> {array} State or function arguments<br/>
> 
> - When used inside a <b>state</b>:<br/>
>  array passed by previous state as { next: 'state-key', args }<br/>
> 
> - When used inside a <b>function</b>:<br/>
>  array passed as the second argument to $.fn( 'function-key', args )<br/>

* * *

Although you can use [$.global\*()] methods to store and retrieve data from a global store, it is sometimes better to simply pass arguments from one state to another.

**example-args.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Generate a random number locally (or use $.osRand())
      const randomNumber = await $.fn("random", [2, 10]);

      // Pass it to the next state
      return { next: "surprise", args: [randomNumber] };
  - key: surprise
    code: |
      // Passed with { next: "surprise", args: [randomNumber] };
      const randomNumber = $.args[0];
      $.log(`The number I was thinking of was ${randomNumber}`);

      // Put the LLM to work
      const prompt = `Multiply ${randomNumber} by itself.`;
      const response = await $.llm(prompt);
srcFunctions:
  - key: random
    code: |
      if (2 !== $.args.length) {
        throw new Error("Expecting 2 arguments");
      }

      // Destructure the function arguments
      const [from, to] = $.args;

      // Generate a random number
      return Math.floor(Math.random() * (to - from + 1)) + from;
srcInputs: []
srcOutputs: []
```

* * *

#### $.current

> {string} Current state key<br/>
> 
> The key of the current Finite-State Machine (FSM) state.<br/>
> Use this property in functions to customize behavior based on the FSM state that called the function.<br/>

* * *

At the core of every Uindow module is a finite-state machine where each state is uniquely identified by its key.  
You may need to reference the $.current or the [$.previous] state key inside functions.

**example-current.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.fn("write-haiku");

      return { next: "middle" };
  - key: middle
    code: |
      await $.fn("write-haiku");

      return { next: "end" };
  - key: end
    code: |
      await $.fn("write-haiku");
srcFunctions:
  - key: write-haiku
    code: |
      // The Old Pond by Matsuo Bashō (1644-1694)
      switch ($.current) {
        case "start":
          $.log("An old silent pond");

          break;

        case "middle":
          $.log("A frog jumps into the pond");

          break;

        case "end":
          $.log("Splash! Silence again.");
          break;
      }

      await $.sleep(1000);
srcInputs: []
srcOutputs: []
```

* * *

#### $.previous

> {string|null} Previous state key<br/>
> 
> The key of the previous Finite-State Machine (FSM) state, or <i>null</i> if this is the first (entry) state.<br/>
> Use this property in functions to customize behavior based on the FSM state that called the function.<br/>

* * *

Following the example for the [$.current] property, here's how one would use the previous state key.

**example-previous.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.fn("write-haiku");

      return { next: "middle" };
  - key: middle
    code: |
      await $.fn("write-haiku");

      return { next: "end" };
  - key: end
    code: |
      await $.fn("write-haiku");
srcFunctions:
  - key: write-haiku
    code: |
      // The Old Pond by Matsuo Bashō (1644-1694)
      switch ($.previous) {
        case null:
          $.log("An old silent pond");

          break;

        case "start":
          $.log("A frog jumps into the pond");

          break;

        case "middle":
          $.log("Splash! Silence again.");
          break;
      }

      await $.sleep(1000);
srcInputs: []
srcOutputs: []
```

* * *

#### async $.fn( fnKey, fnArgs = \[\] )

> Call a function asynchronously.<br/>
> 
> Useful if you're running into source code size limits or when you want better<br/>
> separation of concerns in your module.<br/>
> 
> <i>@param</i> {string} <b>fnKey</b> Function key, 1 to 32 alphanumeric characters or dashes<br/>
> <i>@param</i> {array} <b>fnArgs</b> (optional) Function arguments; accessed with <i>$.args</i><br/>

* * *

Functions allow you to organize your module better and prevent code duplication.  
Here's a simple example for counting down using functions - recursively.

**example-fn.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.fn("countdown", [3]);

      $.log("That was easy");
srcFunctions:
  - key: countdown
    code: |
      const number = $.args[0];

      if (number <= 0) {
        return;
      }

      $.log(number, "success");
      await $.sleep(1000);

      // Recursion is fun!
      await $.fn("countdown", [number - 1]);
srcInputs: []
srcOutputs: []
```

* * *

#### async $.llm( prompt )

> Prompt the locally running large language model.<br/>
> 
> <i>@param</i> {string} <b>prompt</b> Prompt - up to 4096 characters long<br/>
> <i>@return</i> {string} LLM response<br/>
> 
> <i>@throws</i> {Error} If the LLM is not ready<br/>

* * *

Uindow provides easy access to a locally running large language model for complex tasks such as text summarization and sentiment analysis. Please note that LLMs are neither accurate nor deterministic.  
The example below shows when not to use a large language model: mathematical operations are much faster and more accurate in pure JavaScript.

**example-llm.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const startTime = performance.now();

      // Ask the magic box
      const response = await $.llm("Answer with one number: 2 + 3");

      // Log the execution time
      $.log(`Finished in ${(performance.now() - startTime) / 1000} seconds`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.log( message, status = "info" )

> Append a message to the agent logs.<br/>
> 
> <i>@param</i> {any} <b>message</b> Message<br/>
> <i>@param</i> {"info"|"success"|"warning"|"error"} <b>status</b> (optional) Status; default <i>info</i><br/>

* * *

A maximum of 250 logs are retained in the logs panel for each agent. Logs are stored in session and are removed when the app is closed. There are four log types, each with their own color:`info`,`success`,`warning`, and`error`.

**example-log.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      $.log("🍰 A new cake recipe was added.", "info");
      $.log("🧁 The cake has baked successfully!", "success");
      $.log("🔥 The oven temperature is far too high.", "warning");
      $.log("💀 Cake failed to rise, check your ingredients.", "error");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.sleep( ms )

> Pause the execution for a specified number of milliseconds.<br/>
> 
> <i>@param</i> {number} <b>ms</b> Sleep time in milliseconds<br/>

* * *

Sometimes you may need to slow down your script to prevent overloading a website's resources, and other times you might just want a bit of showmanship.

**example-sleep.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      $.log("It's the final countdown:", "warning");
      await $.sleep(1000);

      let counter = 5;
      while (counter-- > 0) {
        $.log(`⌛ ${counter + 1}...`);

        // Wait for it...
        await $.sleep(1000);
      }

      $.log("🚀 Liftoff!", "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.pause( message = "" )

> Pause the execution of the current state indefinitely.<br/>
> When resumed, the current state will be re-executed from the start, not from the current line!<br/>
> 
> <i>@param</i> {string} <b>message</b> (optional) Message displayed in dialog when agent is (re-)selected<br/>

* * *

Uindow modules do not access or store any personal data, such as passwords or cookies.  
If a user needs to log into a website or verify they are human, simply pause the script at the current finite-state machine state and kindly request their input.

**example-pause.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Check if we already asked the user to log in
      if ($.globalRunGet("asked-user")) {
        return;
      }

      // Mark this so we don't enter an infinite loop
      $.globalRunSet("asked-user", true);

      // Look for button that is only available after login
      const buttonKey = await $.doAwaitPresent(".dashboard-button", { timeout: 1 });

      // Ooops! (reCaptcha, login wall etc.)
      if (!buttonKey) {
        $.pause("'Dubito, ergo cogito; cogito, ergo sum' to continue.");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.stop( message = "" )

> Stop the execution of the current state.<br/>
> When resumed, the finite-state machine will start from the first state (the Entry Point 🏁).<br/>
> 
> <i>@param</i> {string} <b>message</b> (optional) Message displayed in dialog when agent is (re-)selected<br/>

* * *

Unlike [$.pause()], the current run is **abandoned** so all values stored with [$.globalRunSet()] are discarded. The next time you start the agent, it will execute normally from the entry state.

**example-stop.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Check if we already asked the user to log in
      if (await $.globalEnvGet("asked-user")) {
        return;
      }

      // Mark this so we don't enter an infinite loop
      // Use the environment cache instead of the run store
      await $.globalEnvSet("asked-user", true);

      // Look for button that is only available after login
      const buttonKey = await $.doAwaitPresent(".dashboard-button", { timeout: 1 });

      // Ooops! (reCaptcha, login wall etc.)
      if (!buttonKey) {
        // Abandon the current run (and clear values in the run store)
        $.stop("State the meaning of life to continue.");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.setTimeout( callback, ms )

> Delays execution of a function by a specified number of milliseconds.<br/>
> 
> <i>@param</i> {function} <b>callback</b> JavaScript function<br/>
> <i>@param</i> {number} <b>ms</b> The number of milliseconds to wait before executing the callback<br/>
> <i>@return</i> {int} Timeout ID<br/>

* * *

Setting a timer is useful for a wide range of algorithms, but you will likely find it most valuable when setting up a listener for an event that has not occurred yet.

**example-setTimeout.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Open test page
      await $.navLoad("about:home/test");

      // Wait for "Get source" button to be present
      const buttonKey = await $.doAwaitPresent("[data-role=dl-source]");

      // Trigger download of "test.js.yaml" in the future
      $.setTimeout(async () => await $.doClick(buttonKey), 500);

      // Grab the next download and store it in outputs
      await $.ioSaveDownload("yaml");
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: yaml
    type: files
    name: Yaml files
    desc: ""
    extensions:
      - yaml
    visible: true
```

* * *

#### $.clearTimeout( timeoutId )

> Cancels a timeout previously established by <i>$.setTimeout</i>.<br/>
> 
> <i>@param</i> {function} <b>timeoutId</b> The identifier of the timeout to cancel, as returned by <i>$.setTimeout</i><br/>

* * *

**example-clearTimeout.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Set the bomb
      const timerId = $.setTimeout(async () => {
        $.log("💥 Boom!", "error");
      }, 500);

      // Clear the bomb
      $.clearTimeout(timerId);
      $.log("All clear", "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.osRequest( url, options = {} )

> OS: Make a request directly from the computer.<br/>
> 
> Useful for bypassing CORS (Cross-Origin Resource Sharing) constraints set by the browser.<br/>
> If you need to make an authenticated request from the currently loaded page, use <i>$.doRequest</i> instead.<br/>
> Note that these requests do not have access to your browser session's cookies.<br/>
> Keywords: ajax, fetch, request, get, post, push.<br/>
> 
> <i>@param</i> {string} <b>url</b> Request URL<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Request options<br/>
> <i>@param</i> {string} <b>options.method</b> (optional) Request method; default <i>GET</i><br/>
> <i>@param</i> {object} <b>options.data</b> (optional) Request data; default <i>{}</i><br/>
> <i>@param</i> {object} <b>options.headers</b> (optional) Request headers; default <i>{}</i><br/>
> <i>@param</i> {boolean} <b>options.json</b> (optional) JSON request; default <i>true</i><br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Request timeout in seconds; default <i>60</i><br/>
> <i>@param</i> {boolean} <b>options.resData</b> (optional) Parse and return the response data; default <i>true</i><br/>
> <i>@return</i> {{ ok:boolean, status:number, headers:object, data:mixed}} Response object<br/>
> 
> <i>@throws</i> {Error} If request failed<br/>

* * *

This method acts like a proxy, bypassing any CORS restrictions.  
If you need to pass along cookies with your request, first nagivate to the target domain using [$.navLoad()] then issue the request with [$.doRequest()] or [$.ioSaveRequest()].

**example-osRequest.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const url = "http://localhost:7199/manifest.json";

      // JSON request (CORS is bypassed)
      $.log(`Fetching ${url} from OS`, "success");
      const response = await $.osRequest(url);
      $.log([response?.status, response?.headers, response?.data]);

      // Fetch headers only
      $.log(`Fetching ${url} without data from OS`, "success");
      const responseNoData = await $.osRequest(url, { resData: false });
      $.log([responseNoData?.status, responseNoData?.headers, responseNoData?.data]);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.osFileGetUrl( filePath )

> OS: Prepare <i>file:///</i> URL from file path.<br/>
> 
> Convert file path to file URL to be used in table outputs.<br/>
> 
> Use the <i>src_output_set_table</i> tool to define a table output.<br/>
> Use the <i>src_output_set_files</i> tool to define a hidden files output (<i>visible</i> set to <i>false</i>).<br/>
> 
> <i>@param</i> {string|null} <b>filePath</b> File path generated with <i>$.ioSave\*</i> methods or <i>$.ioInputFiles</i><br/>
> <i>@return</i> {string|null} URI encoded file:/// URL or <i>null</i> on error<br/>

* * *

Table cells automatically enrich `file://` links with previews. This allows you to show file previews alongside other information in table rows while hiding redundant file outputs from the Results tab.

**example-osFileGetUrl.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Read input URL
      const url = $.ioInputString("url");

      // Load page
      await $.navLoad(url);

      // Get page title
      const pageTitle = await $.navGetTitle();

      // Save a screenshot - but the file explorer is hidden for this output (visible = false)
      const { path, width, height } = await $.ioSaveScreenshot("screenshots", { extension: "png" });

      // Prepare the screenshot string
      const screenshot = $.osFileGetUrl(path) + ` (${width}x${height})`;

      // Store complete data as a table row
      await $.ioOutputRow("pages", { url, screenshot });

      // Increment the temporary tick
      $.doTick("screenshot");
srcFunctions: []
srcInputs:
  - key: url
    type: string
    name: Page URL
    desc: ""
    max: 1024
    isList: false
    default: https://uindow.com/
srcOutputs:
  - key: screenshots
    type: files
    name: Screenshots
    desc: Page screenshots
    max: 32
    extensions:
      - png
    visible: false
  - key: pages
    type: table
    name: Visited pages
    desc: ""
    columns:
      - url
      - screenshot
```

* * *

#### async $.osFileGetSize( filePath )

> OS: Get file size.<br/>
> 
> <i>@param</i> {string|null} <b>filePath</b> File path generated with <i>$.ioSave\*</i> methods or <i>$.ioInputFiles</i><br/>
> <i>@return</i> {{ int:int, string:string}|null} File size in bytes and as a human-readable string expressed in KiB, MiB, GiB, and TiB<br/>

* * *

The two fields serve different purposes: `int` is the raw byte count you compare against, and `string` is a preformatted label in KiB, MiB, GiB or TiB, ready to drop into a log line or a table cell.  
Checking the size is the cheapest way to notice that a download went wrong. A saved login wall or error page is still a successful HTTP response, so `$.ioSaveUrl` hands back a path either way - but the file is almost always far smaller than the real one.  
An unreadable or missing path returns `null`, so check for it before reaching into the result.

**example-osFileGetSize.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Save something, then look at what actually landed on disk
      const filePath = await $.ioSaveUrl("downloads", "http://localhost:7199/manifest.json");
      if (null === filePath) {
        throw new Error("$.ioSaveUrl failed");
      }

      const size = await $.osFileGetSize(filePath);
      if (null === size) {
        throw new Error("Could not read the file size");
      }

      // "int" is for comparisons, "string" is for humans
      $.log(`Downloaded ${size.string}`, "success");

      // A near-empty file usually means an error page was saved instead of the real thing
      if (size.int < 128) {
        $.log(`Only ${size.int} bytes - looks truncated, skipping`, "warning");

        return;
      }

      // Report it alongside the human-readable size
      await $.ioOutputRow("files", { path: filePath, size: size.string });

      return { next: "check-inputs" };
  - key: check-inputs
    code: |
      // The same works for files the user supplied
      let totalBytes = 0;
      for (const inputPath of $.ioInputFiles("attachments")) {
        const size = await $.osFileGetSize(inputPath);
        if (null === size) {
          continue;
        }

        totalBytes += size.int;
      }

      $.log(`Inputs total ${totalBytes} bytes`);
srcFunctions: []
srcInputs:
  - key: attachments
    type: files
    name: Attachments
    desc: ""
    extensions:
      - json
      - txt
srcOutputs:
  - key: downloads
    type: files
    name: Downloads
    desc: ""
    max: 1024
    extensions:
      - json
  - key: files
    type: table
    name: Saved files
    desc: ""
    columns:
      - path
      - size
```

* * *

#### async $.osFileShow( filePath )

> OS: Show file in folder.<br/>
> 
> <i>@param</i> {string} <b>filePath</b> File path generated with <i>$.ioSave\*</i> methods or <i>$.ioInputFiles</i><br/>
> <i>@return</i> {boolean}<br/>

* * *

It is recommended that you use this method with caution and only with the explicit permission of users, as opening folders may interfere with their activities.

**example-osFileShow.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const url = "http://localhost:7199/manifest.json";

      // Save the file to disk
      const filePath = await $.ioSaveUrl("json-files", url);

      // Open containing folder (if the user allows it)
      if ($.ioInputBoolean("show-file-after-download")) {
        await $.osFileShow(filePath);
      }
srcFunctions: []
srcInputs:
  - key: show-file-after-download
    type: boolean
    name: Show files
    desc: Show downloaded files when the script finishes
srcOutputs:
  - key: json-files
    type: files
    name: JSON files
    desc: ""
    max: 1024
    extensions:
      - json
```

* * *

#### $.osRand( min, max, options = {} )

> OS: Generate a random signed integer between the specified minimum and maximum values (inclusive), or a random alphanumeric string with a length between the specified minimum and maximum values.<br/>
> 
> <i>@param</i> {int} <b>min</b> Minimum signed integer value OR minimum string length<br/>
> <i>@param</i> {int} <b>max</b> Maximum signed integer value OR maximum string length<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Random generator options<br/>
> <i>@param</i> {boolean} <b>options.string</b> (optional) Return a random string instead; default <i>false</i>; if true, <i>min</i> and <i>max</i> define the length of the returned string<br/>
> <i>@return</i> {int|string} A random signed integer between <i>min</i> and <i>max</i> (inclusive) OR a random string between <i>min</i> and <i>max</i> characters long, but not longer than 512 characters<br/>

* * *

Introducing randomness into the behavior of modules is so useful that we decided to dedicate a helper function to it.  
You could use `Math.floor(Math.random() * (max - min + 1)) + min` instead, but this is cleaner.

**example-osRand.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const minTemp = -15;
      const maxTemp = 25;

      const predictedTemp = $.osRand(minTemp, maxTemp);

      $.log(`🌤️ Forecast says: ${predictedTemp}°C`, "success");

      switch (true) {
        case predictedTemp < 0:
          const randomString = $.osRand(3, 4, { string: true });
          $.log(`Brrr${randomString}... this is cold! 🥶`);
          break;

        case predictedTemp < 20:
          $.log("Perfect for a walk. 😄");
          break;

        default:
          $.log("Time for some ice cream. 😎");
          break;
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.globalEnvGet( envKey = null )

> Environment globals: Get environment variable(s). Values are JSON serializable.<br/>
> These values persit between runs but are reset on module install, fork or release.<br/>
> 
> <i>@param</i> {string|null} <b>envKey</b> (optional) Environment variable key or <i>null</i> for all values as a key-value object; default <i>null</i><br/>
> <i>@return</i> {object|any|null}<br/>

* * *

In this example, we're using the environment cache to perform an action only once per day.

**example-globalEnvGet.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Prepare date in YYYY-MM-DD format
      const dateToday = new Date().toISOString().split("T")[0];

      // Fetch the date stored in environment cache (persistent between runs)
      const dateStored = await $.globalEnvGet("date");

      if (dateToday !== dateStored) {
        // Do something new!
        $.log("New day, new possibilities ☀️");

        // Store today in environment cache
        await $.globalEnvSet("date", dateToday);
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.globalEnvSet( envKey, envValue )

> Environment globals: Set environment variable. Values must be JSON serializable.<br/>
> These values persit between runs but are reset on module install, fork or release.<br/>
> The total environment cache size must not exceeded 512kB per agent.<br/>
> 
> <i>@param</i> {string} <b>envKey</b> Environment variable key<br/>
> <i>@param</i> {any|null} <b>envValue</b> Environment variable value; if <i>null</i>, the key is removed<br/>
> <i>@return</i> {boolean}<br/>

* * *

In this example, we're listing and removing all values from the environment cache.

**example-globalEnvSet.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Set some random values to environment cache (persistent between runs)
      for (let i = 1; i <= 3; i++) {
        const randomInt = $.osRand(10, 99);
        const randomString = $.osRand(10, 15, { string: true });
        await $.globalEnvSet(`key-${randomInt}`, randomString);
      }

      // Get all values stored in environment cache
      const envValues = await $.globalEnvGet();

      // Log them as an object
      $.log(envValues);

      // Log them individually
      for (const envKey of Object.keys(envValues)) {
        $.log(`✨ ${envKey} = ${envValues[envKey]}`, "success");
      }

      // Clean the cache
      for (const envKey of Object.keys(envValues)) {
        // Setting value to null deletes it from the environment cache
        await $.globalEnvSet(envKey, null);
        $.log(`🗑️ ${envKey} environment value removed`, "warning");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.globalRunGet( runKey = null )

> Run globals: Get global variable(s) for this run.<br/>
> These values are reset before each run.<br/>
> 
> <i>@param</i> {string|null} <b>runKey</b> (optional) Run variable key or <i>null</i> for all values as a key-value object; default <i>null</i><br/>
> <i>@return</i> {object|any|null}<br/>

* * *

The run store is the scratchpad for a single run: set a value in one state, read it in the next, and it's gone by the time the agent starts again. Use `$.globalEnvGet` when a value needs to outlive the run instead.  
Being synchronous is the practical difference from the environment store, which has to be awaited. A missing key reads as `null` rather than throwing, so `??` is the usual way to supply a starting value.  
Guarding re-entry is the pattern worth knowing. A state resumed after `$.pause` runs again from the top, so a flag checked at the start is what stops the work before the pause from being repeated. Calling it with no key returns the whole store, which is mostly useful for a one-off look while debugging.

**example-globalRunGet.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Run globals are synchronous - no await here
      if ($.globalRunGet("visited")) {
        $.log("Already been through this state during this run");

        return { next: "work" };
      }

      $.globalRunSet("visited", true);
      await $.navLoad("about:home/test/");

      return { next: "work" };
  - key: work
    code: |
      // A key that was never set reads as null, so default it
      const cursor = $.globalRunGet("cursor") ?? 0;
      $.log(`Resuming from row ${cursor}`);

      $.globalRunSet("cursor", cursor + 10);

      // Omit the key to inspect everything at once - handy while debugging
      $.log($.globalRunGet());
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.globalRunSet( runKey, runValue )

> Run globals: Set global variable for this run.<br/>
> These values are reset before each run.<br/>
> 
> <i>@param</i> {string} <b>runKey</b> Run variable key<br/>
> <i>@param</i> {any|null} <b>runValue</b> Run variable value; if <i>null</i>, the key is removed<br/>
> <i>@return</i> {boolean}<br/>

* * *

Values live for exactly one run and are synchronous to write, which makes this the right place for anything a run needs to carry between states - a cursor, a set of things already seen, a flag saying the user has been asked something.  
The return value is more informative than it looks. It reports `false` when nothing actually changed, which covers both an `undefined` value and writing a value identical to the one already stored - so a `false` here doesn't necessarily mean anything went wrong.  
Setting `null` deletes rather than storing null, so there's no separate remove call. Note that `$.stop` abandons the run and discards everything stored here, while `$.pause` keeps it - which is what makes the guard above work.

**example-globalRunSet.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Anything JSON serializable
      $.globalRunSet("cursor", 0);
      $.globalRunSet("seen", ["alpha", "beta"]);

      // Writing the same value again reports false - nothing changed
      if (!$.globalRunSet("cursor", 0)) {
        $.log("The cursor was already 0");
      }

      // null removes the key entirely
      $.globalRunSet("seen", null);
      if (Object.keys($.globalRunGet()).includes("seen")) {
        throw new Error("$.globalRunSet failed to delete the key");
      }

      return { next: "ask-user" };
  - key: ask-user
    code: |
      // A paused state re-runs from the top when the agent resumes,
      // so a flag is what keeps this from asking twice
      if (!$.globalRunGet("asked-user")) {
        $.globalRunSet("asked-user", true);

        $.pause("Log in, then resume the agent.");
      }

      $.log("Carrying on where we left off", "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.ioInputInt( ioKey )

> IO: Get input integer(s).<br/>
> This method returns an integer or an array of integers based on the selected input format.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Integer input key<br/>
> <i>@return</i> {int | int[]} Integer(s) supplied by user<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid input integer key<br/>

* * *

The shape of the result follows the declaration rather than the call: an input declared as a list hands back an array, everything else a single integer. Worth checking which you declared before calling `.slice` on something that turned out to be a number.  
A single input the user left empty reads as `null` when the declaration has no `default`, so either declare one or fall back with `??`. The list form is kinder - an empty list is an empty array, never `null`.  
On an integer input `min` and `max` bound the _value_ the user may enter, so the Settings tab refuses anything outside the range before the module ever runs. Declaring `options` instead restricts the field to a fixed set of numbers. Either way the validation lives in the declaration rather than in your code.  
Only the key lookup can fail, and it throws rather than returning nothing, so a typo in `ioKey` surfaces immediately instead of quietly behaving like an empty input.

**example-ioInputInt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // How many tries does the machine get?
      const tries = $.ioInputInt("tries");

      // Which numbers should the machine guess?
      const numbers = $.ioInputInt("lucky-numbers");

      // Roll the dice
      return { next: "roll-dice", args: [tries, numbers] };
  - key: roll-dice
    code: |
      const [tries, numbers] = $.args;

      // Let's roll the dice
      for (let i = 1; i <= tries; i++) {
        // Guess a number (same min,max restrictions as input lucky-numbers)
        const guess = $.osRand(1, 100);

        // Did we get it?
        if (numbers.includes(guess)) {
          $.log(`Guessed it - you were thinking of ${guess}!`, "success");
          $.doTick("success");
          return;
        }
      }

      $.log("No luck this time. Try again!", "warning");
      $.doTick("warning");
srcFunctions: []
srcInputs:
  - key: tries
    type: int
    name: Number of tries
    desc: How many times should the machine attempt to guess one of our lucky numbers?
    min: 1
    max: 100
    isList: false
    default: 10
  - key: lucky-numbers
    type: int
    name: Lucky numbers
    desc: List of lucky numbers - if the machine guesses just one of them, we win!
    min: 1
    max: 100
    isList: true
srcOutputs: []
```

* * *

#### $.ioInputString( ioKey )

> IO: Get input string(s).<br/>
> This method returns a string or an array of strings based on the selected input format.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> String input key<br/>
> <i>@return</i> {string | string[]} String(s) supplied by user<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid input string key<br/>

* * *

As with the integer form, a list declaration returns an array and everything else a single string, and an empty single input reads as `null` rather than an empty string. Testing `null === value` before `value.length` avoids the obvious crash.  
Declaring `options` together with a `default`, as `mode` does above, turns the field into a choice that always has a value - no fallback needed, and no chance of a typo reaching your code. That's usually better than accepting free text and validating it yourself.  
On a string input `min` and `max` bound the _length_ of the text rather than its value - the integer equivalents bound the number itself. Inputs and outputs are declared independently, so an input that accepts more than the output you intend to write it to will lose the overflow; keep the two declarations in step, or send long text to `$.ioSaveText` instead.

**example-ioInputString.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // A single string - may be null when the user left it empty
      const query = $.ioInputString("query");
      if (null === query || !query.length) {
        $.log("No search term supplied", "warning");

        return;
      }

      // An input declared with options and a default always has a value
      const mode = $.ioInputString("mode");
      $.log(`Searching for "${query}" in ${mode} mode`);

      return { next: "visit-urls" };
  - key: visit-urls
    code: |
      // A list input returns an array of strings
      const urls = $.ioInputString("urls");

      for (const url of urls) {
        try {
          await $.navLoad(url, { timeout: 20 });
        } catch (error) {
          $.log(`Skipped ${url}: ${error.message}`, "warning");

          continue;
        }

        await $.ioOutputRow("pages", {
          url: await $.navGetUrl(),
          title: await $.navGetTitle()
        });

        $.doTick("view");
      }
srcFunctions: []
srcInputs:
  - key: query
    type: string
    name: Search term
    desc: ""
    max: 256
    options: []
  - key: urls
    type: string
    name: URLs
    desc: One URL per line
    max: 1024
    isList: true
    options: []
  - key: mode
    type: string
    name: Search mode
    desc: ""
    max: 32
    options:
      - quick
      - thorough
    default: quick
srcOutputs:
  - key: pages
    type: table
    name: Visited pages
    desc: ""
    columns:
      - url
      - title
```

* * *

#### $.ioInputBoolean( ioKey )

> IO: Get input boolean.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Boolean input key<br/>
> <i>@return</i> {boolean} Boolean supplied by user<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid input boolean key<br/>

* * *

The result is always a real boolean - a switch the user never touched reads as `false` rather than `null` or `undefined`, so there's nothing to default and no need for `??`.  
Booleans are the natural way to expose the choices that change what a module does rather than what it works on: dry run, verbose logging, whether to open a folder when the run finishes.  
They also double as UI controls. Any other input can name a boolean in its `depends` property, as `log-prefix` does above, and it stays hidden from the Settings tab until that switch is on - so a whole section of the form can fold away behind one checkbox. Only non-boolean inputs can depend on a boolean, so the dependencies never nest.  
Only the key is looked up here, so a typo throws rather than quietly returning `false`.

**example-ioInputBoolean.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Reading a boolean input needs no await
      const dryRun = $.ioInputBoolean("dry-run");
      const verbose = $.ioInputBoolean("verbose");

      if (verbose) {
        $.log("Verbose logging is on");
      }

      await $.navLoad("about:home/test/");

      if (dryRun) {
        $.log("Dry run - capturing a preview instead of submitting", "warning");
        await $.ioSaveScreenshot("previews", { full: true });

        return;
      }

      const submitKey = await $.doQuery("button", { contains: "submit" });
      if (null !== submitKey) {
        await $.doClick(submitKey);
      }
srcFunctions: []
srcInputs:
  - key: dry-run
    type: boolean
    name: Dry run
    desc: Preview the result without submitting anything
  - key: verbose
    type: boolean
    name: Verbose logging
    desc: ""
  - key: log-prefix
    type: string
    name: Log prefix
    desc: Hidden until verbose logging is switched on
    max: 32
    default: "[uindow]"
    depends: verbose
srcOutputs:
  - key: previews
    type: files
    name: Previews
    desc: ""
    max: 128
    extensions:
      - png
```

* * *

#### async $.ioInputRow( ioKey, index = null )

> IO: Get the next available table row and increment the row index internally.<br/>
> 
> Alternatively, get the row at the specified index.<br/>
> For example, index 0 returns the first table row object with the defined columns, or null if the table is empty<br/>
> 
> Use the <i>src_input_set_table</i> tool to declare input table columns.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Table input key<br/>
> <i>@param</i> {int} <b>index</b> (optional) Table index; defaults to <i>null</i><br/>
> <i>@return</i> {(Object&lt;string, string&gt; | null)} Current row, or <i>null</i> if the end of the table has been reached<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid input table key.<br/>

* * *

For performance reasons, tables are not loaded into memory; instead, they are accessed one row at a time.

**example-ioInputRow.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Go through the clients table one row at a time
      let row = null;
      while ((row = await $.ioInputRow("clients"))) {
        $.log(`Client name: ${row.name}`);
        $.log(`Client age: ${row.age}`);
      }
srcFunctions: []
srcInputs:
  - key: clients
    type: table
    name: Company clients
    desc: List of clients
    columns:
      - name
      - age
srcOutputs: []
```

* * *

#### $.ioInputFiles( ioKey )

> IO: Get input file paths.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files input key<br/>
> <i>@return</i> {string[]} Input file paths<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid input files key<br/>

* * *

Always an array, empty when the user supplied nothing, so checking `length` is the only guard you need.  
What comes back are absolute paths on disk rather than file contents, which is what makes them useful across the rest of the API: hand them to `$.doChooseFiles` to attach them to a page, to `$.osFileGetSize` to check them, to `$.osFileShow` to reveal them in a folder, or to `$.osFileGetUrl` to render them as previews in a table output.  
The declaration is where you constrain what a user may pick, rather than filtering afterwards: `extensions` limits the file types and `min` and `max` bound each file's size in megabytes. `multiple` only affects the Settings tab, deciding whether its drop box takes one file or several - the stored value is an array of paths either way, so your code never needs a separate branch for the single-file case.

**example-ioInputFiles.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Paths of the files the user supplied - no await needed
      const filePaths = $.ioInputFiles("uploads");
      if (!filePaths.length) {
        $.log("No files supplied, nothing to do", "warning");

        return;
      }

      $.log(`${filePaths.length} file(s) supplied`);

      // These are real paths on disk, so they can be measured
      for (const filePath of filePaths) {
        const size = await $.osFileGetSize(filePath);
        $.log(`${filePath} - ${size ? size.string : "unreadable"}`);
      }

      return { next: "attach" };
  - key: attach
    code: |
      const filePaths = $.ioInputFiles("uploads");

      await $.navLoad("about:home/test/");

      // The same paths can be handed straight to a file input
      const fileInput = await $.doQuery("input[type=file]");
      if (null !== fileInput) {
        await $.doChooseFiles(fileInput, filePaths);
        $.doTick("upload", filePaths.length);
      }
srcFunctions: []
srcInputs:
  - key: uploads
    type: files
    name: Files to upload
    desc: ""
    extensions:
      - png
      - jpg
      - jpeg
      - pdf
    multiple: true
    max: 25
srcOutputs: []
```

* * *

#### async $.ioOutputInt( ioKey, int )

> IO: Set output integer.<br/>
> Subsequent calls override previous values.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Integer output key<br/>
> <i>@param</i> {int} <b>int</b> Integer<br/>
> <i>@return</i> {boolean} <i>true</i> on success, false for invalid integer<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output integer key<br/>

* * *

Within a run a scalar output holds a single value and every call overwrites the last, so writing inside the loop rather than once at the end costs almost nothing and means an interrupted run still shows how far it got.  
Across runs it behaves quite differently. The Results tab keeps each run's results separately, so an integer output contributes one value per run and is drawn as a line graph of those values - which makes it a record of how a number moves over time rather than a single figure. Pages visited, items collected and errors seen are all worth exposing this way. The optional `min` and `max` on the declaration bound the value.  
The value is parsed with `parseInt`, so `"42"` is accepted and `4.7` becomes `4`. Round it yourself first when the difference matters.  
The two failure modes are separate: an `ioKey` that isn't a declared integer output throws, while a value that can't be parsed returns `false`. Only the second is worth checking at runtime.

**example-ioOutputInt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      let visited = 0;
      let failed = 0;

      for (const url of $.ioInputString("urls")) {
        try {
          await $.navLoad(url, { timeout: 20 });
          visited++;
        } catch (error) {
          failed++;
        }

        // Each call replaces the previous value, so writing on every
        // pass means a run that stops early still reports its progress
        await $.ioOutputInt("visited", visited);
        await $.ioOutputInt("failed", failed);
      }

      $.log(`Visited ${visited}, failed ${failed}`, failed ? "warning" : "success");

      return { next: "rejects" };
  - key: rejects
    code: |
      // Values go through parseInt, so a numeric string is fine
      await $.ioOutputInt("visited", "42");

      // ...but a fraction is truncated rather than rounded
      await $.ioOutputInt("visited", 4.7);

      // Anything that isn't a number at all returns false
      if (!(await $.ioOutputInt("visited", "not a number"))) {
        $.log("Rejected a non-numeric value", "warning");
      }
srcFunctions: []
srcInputs:
  - key: urls
    type: string
    name: URLs
    desc: One URL per line
    max: 1024
    isList: true
    options: []
srcOutputs:
  - key: visited
    type: int
    name: Pages visited
    desc: ""
    min: 0
  - key: failed
    type: int
    name: Pages failed
    desc: ""
    min: 0
```

* * *

#### async $.ioOutputString( ioKey, string )

> IO: Set output string.<br/>
> Subsequent calls override previous values.<br/>
> 
> If you need to store longer strings, use <i>$.ioSaveText</i> instead.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> String output key<br/>
> <i>@param</i> {string} <b>string</b> String<br/>
> <i>@return</i> {boolean} <i>true</i> on success, false for invalid string<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output string key<br/>

* * *

The `max` length you declare on the output is the thing to design around. Text longer than that is cut rather than refused, so a module that writes scraped copy straight into a string output can lose the end of it with nothing to show that anything went wrong. Measure against your own declaration first, as above, and send anything longer to `$.ioSaveText`.  
That makes `min` and `max` worth setting deliberately rather than leaving open, particularly when a value has a known shape - a postcode, a status word, a short verdict. The declaration is both the promise and the limit.  
The type check is strict - a number returns `false` and writes nothing, so convert explicitly. An invalid `ioKey` throws instead, since that's a mistake in the module rather than in the data.  
Each call replaces the last, which makes these outputs a good fit for the handful of headline facts a run produces. Anything that accumulates row by row wants `$.ioOutputRow`.

**example-ioOutputString.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Short, single values belong in a string output
      await $.ioOutputString("title", await $.navGetTitle());
      await $.ioOutputString("url", await $.navGetUrl());

      return { next: "long-text" };
  - key: long-text
    code: |
      const article = await $.doGetContent("[data-role=article]");
      if ("string" !== typeof article) {
        return;
      }

      // The value is cut to the max declared for this output, so
      // measure against your own declaration before writing
      const SUMMARY_MAX = 512;

      if (article.length > SUMMARY_MAX) {
        $.log(`Article is ${article.length} characters - saving to disk`);
        await $.ioSaveText("articles", article, { extension: "txt" });

        return;
      }

      await $.ioOutputString("summary", article);

      return { next: "strict-types" };
  - key: strict-types
    code: |
      // Only strings are accepted - numbers have to be converted first
      if (!(await $.ioOutputString("summary", 42))) {
        $.log("A non-string was rejected", "warning");
      }

      await $.ioOutputString("summary", `${42}`);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: title
    type: string
    name: Page title
    desc: ""
    max: 1024
  - key: url
    type: string
    name: Page URL
    desc: ""
    max: 1024
  - key: summary
    type: string
    name: Summary
    desc: ""
    max: 512
  - key: articles
    type: files
    name: Articles
    desc: ""
    max: 64
    extensions:
      - txt
```

* * *

#### async $.ioOutputBoolean( ioKey, boolean )

> IO: Set output boolean.<br/>
> Subsequent calls override previous values.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Boolean output key<br/>
> <i>@param</i> {boolean} <b>boolean</b> Boolean value<br/>
> <i>@return</i> {boolean} <i>true</i> on success, false for invalid boolean<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output boolean key<br/>

* * *

A boolean output is the natural way to answer the single question a monitoring module exists to answer - is it available, did the check pass, was anything found - in a form another tool can act on without parsing text.  
The type check is strict: `"yes"`, `1` and a non-null element key are all rejected and return `false` without writing anything. Convert with `!!` or an explicit comparison before calling, as the second state does.  
In the Results tab a boolean output is drawn as a single green or red dot - one per run, since scalars are replaced within a run and kept separately across them. That makes it a good fit for the one headline verdict of a run, and it reads as a history of passes and failures once a module has run a few times.  
Later calls replace earlier ones, so a value written optimistically at the start can be corrected once the run knows better.

**example-ioOutputBoolean.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Report a yes/no finding for the run
      const bannerKey = await $.doQuery("[data-role=out-of-stock]");
      const inStock = null === bannerKey;

      await $.ioOutputBoolean("in-stock", inStock);
      $.log(inStock ? "In stock" : "Out of stock", inStock ? "success" : "warning");

      return { next: "strict-types" };
  - key: strict-types
    code: |
      // Only real booleans are stored - a truthy value is not enough.
      // Passing an element key here returns false and writes nothing.
      const bannerKey = await $.doQuery("[data-role=out-of-stock]");

      if (!(await $.ioOutputBoolean("in-stock", bannerKey))) {
        $.log("A non-boolean was rejected", "warning");
      }

      // Coerce first when the value came from something looser
      await $.ioOutputBoolean("in-stock", !bannerKey);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: in-stock
    type: boolean
    name: In stock
    desc: ""
```

* * *

#### async $.ioOutputRow( ioKey, row )

> IO: Append a row to output table.<br/>
> 
> Use the <i>src_output_set_table</i> tool to declare output table columns.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Table output key<br/>
> <i>@param</i> {Object&lt;string,string&gt;} <b>row</b> Row object<br/>
> <i>@return</i> {boolean} <i>true</i> on success, false for invalid row object<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output table key<br/>

* * *

Output tables are append-only: each call adds one row at the end, so results are written out as you go rather than collected in memory and flushed at the end. If the agent stops halfway through, the rows written so far are still there.  
That's the opposite of how the scalar outputs behave. Where an integer or string output is replaced by each call and keeps one value per run, tables and files accumulate - and the Results tab retains every run, so rows can be filtered and queried across the whole history rather than just the last pass.  
The two failure modes are distinct. An `ioKey` that isn't a declared table output throws, because that's a mistake in the module rather than in the data. A `row` that isn't an object returns `false` instead, so a single malformed record can be logged and skipped without abandoning the remaining rows.  
The keys of the row object correspond to the columns declared in the output. A table takes up to 6 columns of up to 32 characters each, and a module can define at most 6 output tables - so a wide scrape needs either a narrower shape or a file written with `$.ioSaveText`.

**example-ioOutputRow.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Read the input table one row at a time and write a result row for each
      let row = null;
      while ((row = await $.ioInputRow("subjects"))) {
        const subject = row.subject;
        $.log(`Working on ${subject}`);

        const joke = await $.llm(`Tell me a short joke about ${subject}`);

        // Keys map onto the columns declared in srcOutputs.
        // A row that isn't an object returns false rather than throwing.
        const saved = await $.ioOutputRow("jokes", { subject, joke });
        if (!saved) {
          $.log(`Could not append a row for ${subject}`, "warning");
        }
      }

      $.log("Every subject has been written to the output table", "success");
srcFunctions: []
srcInputs:
  - key: subjects
    type: table
    name: Subjects
    desc: A list of subjects to joke about
    columns:
      - subject
srcOutputs:
  - key: jokes
    type: table
    name: Jokes
    desc: One joke per subject
    columns:
      - subject
      - joke
```

* * *

#### async $.ioSaveText( ioKey, text, options = {} )

> IO: Save text to disk as new file.<br/>
> 
> Useful for saving arbitrary strings in custom formats like JSON, YAML, INI etc.<br/>
> For strings that are shorter than or equal to <b>1024</b> characters, you can use <i>$.ioOutputString</i>.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {string} <b>text</b> Text to save<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Save options<br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@return</i> {string | null} File path on success, <i>null</i> if download failed<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key<br/>

* * *

Every call writes a new file rather than appending, so build the whole string in memory and save it once. For short text that doesn't need to be a file, `$.ioOutputString` is simpler - as long as it fits inside the `max` length declared on that output.  
The extension has to be one of those declared on the output, and an unrecognised one quietly falls back to the first in the list - so a file you expected as `.csv` can arrive as `.json` if the declaration doesn't mention CSV.  
The `min` and `max` declared on a files output are size bounds in megabytes, enforced as the file is written. Both are real constraints - a file that comes out too small is rejected just as one that comes out too large is - and either way the throw is followed by the partial file being cleaned up, so a failed save won't leave a truncated document in the results. Because Uindow runs locally, the ceiling can be as generous as your disk allows.

**example-ioSaveText.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Anything you can build as a string: JSON, YAML, INI, CSV
      const report = JSON.stringify(
        {
          url: await $.navGetUrl(),
          title: await $.navGetTitle(),
          at: new Date().toISOString()
        },
        null,
        2
      );

      const jsonPath = await $.ioSaveText("reports", report, { extension: "json" });
      if (null === jsonPath) {
        throw new Error("$.ioSaveText failed");
      }

      $.log(`Wrote ${report.length} characters to ${jsonPath}`, "success");

      return { next: "csv" };
  - key: csv
    code: |
      // Building a CSV by hand is worth it when the shape doesn't
      // suit a table output, or when the file is the deliverable
      const rows = [["url", "heading"]];
      const pageUrl = await $.navGetUrl();

      for (const headingKey of await $.doQueryAll("h2")) {
        rows.push([pageUrl, await $.doGetContent(headingKey)]);
      }

      const escape = (value) => '"' + String(value).replace(/"/g, '""') + '"';
      const csv = rows.map((cells) => cells.map(escape).join(",")).join("\n");

      const csvPath = await $.ioSaveText("reports", csv, { extension: "csv" });
      if (null !== csvPath) {
        $.log(`Saved ${rows.length - 1} rows`, "success");
        $.doTick("collect", rows.length - 1);
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: reports
    type: files
    name: Reports
    desc: ""
    max: 64
    extensions:
      - json
      - csv
      - txt
```

* * *

#### async $.ioSaveDownload( ioKey, options = {} )

> IO: Capture the next downloaded file and save it to disk.<br/>
> 
> Useful for saving any file download, regardless of how it was trigerred.<br/>
> Defer the event that triggers the download with <i>$.setTimeout()</i> before calling <i>$.ioSaveDownload</i>.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Save options<br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Download timeout in seconds; default <i>600</i><br/>
> <i>@return</i> {string | null} File path on success, <i>null</i> if download failed<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key<br/>

* * *

The ordering here is the whole trick. This call waits for the _next_ download, so the thing that starts the download has to happen while it's already waiting - hence deferring the click with `$.setTimeout`. Clicking first and calling afterwards means the download has come and gone before anything was listening.  
Use it when you can't address the file directly: downloads produced by a form submission, generated on the fly behind a button, or sitting behind a one-time link. When you already know the URL, `$.ioSaveUrl` is simpler, and `$.ioSaveRequest` covers requests you need to shape with headers or a body.  
A download that never arrives returns `null` once the timeout expires. The default of 600 seconds is generous for a large export but a long time to wait on a click that silently did nothing, so lower it when you know the file is small.

**example-ioSaveDownload.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Arm the capture first, then let the click happen while it waits
      const srcButton = await $.doQuery('[data-role="dl-source"]');
      $.setTimeout(async () => await $.doClick(srcButton), 500);

      const savePath = await $.ioSaveDownload("yaml", { timeout: 120 });
      if (null === savePath) {
        throw new Error("$.ioSaveDownload failed");
      }

      $.log(`Saved to ${savePath}`, "success");
      $.doTick("download");

      return { next: "custom-extension" };
  - key: custom-extension
    code: |
      const logoButton = await $.doQuery('[data-role="dl-logo"]');
      if (null === logoButton) {
        return;
      }

      $.setTimeout(async () => await $.doClick(logoButton), 500);

      // Stored under a declared extension whatever the URL happens to say
      const imgPath = await $.ioSaveDownload("images", { extension: "jpeg" });
      if (null === imgPath) {
        $.log("Nothing was downloaded", "warning");

        return;
      }

      $.log(`Image saved as ${imgPath}`);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: yaml
    type: files
    name: Yaml files
    desc: ""
    max: 512
    extensions:
      - yaml
  - key: images
    type: files
    name: Images
    desc: ""
    max: 512
    extensions:
      - jpeg
      - png
```

* * *

#### async $.ioSaveScreenshot( ioKey, options = {} )

> IO: Take a screenshot of the web page and save it to disk.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Save options<br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@param</i> {boolean} <b>options.full</b> (optional) Grab a full-page screenshot; default <i>false</i> to grab a screenshot of the visible viewport<br/>
> <i>@param</i> {boolean} <b>options.dpr</b> (optional) Use Device Pixel Ratio (DPR); default <i>false</i>; output video at true scale, which might be 2:1 instead of 1:1 on MacOS<br/>
> <i>@param</i> {int} <b>options.wait</b> (optional) Wait time in milliseconds before grabbing screenshot; default <i>100</i>; [100, 10000]<br/>
> <i>@return</i> {{ path:(string|null), width:int, height:int, error: (string|null)}} Screenshot details<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key<br/>

* * *

The returned object reports the failure in `error` and leaves `path` as `null` rather than throwing, so check `path` before treating the file as saved. An invalid `ioKey` is the one case that does throw.  
`{ full: true }` captures the entire scrollable document instead of the viewport, which is what you usually want for archiving a page. Raise `wait` when the page loads images or charts lazily, and set `dpr` to `true` for retina-scale output at the cost of a much larger file.  
The extension must be one of those declared in the files output, otherwise the first declared extension is used instead.

**example-ioSaveScreenshot.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Just what the user would see, as PNG
      const viewportShot = await $.ioSaveScreenshot("images", { extension: "png" });
      if (null === viewportShot.path) {
        throw new Error(`Screenshot failed: ${viewportShot.error}`);
      }
      $.log(`Saved ${viewportShot.width}x${viewportShot.height} to ${viewportShot.path}`, "success");

      // The whole document as JPEG, giving lazy-loaded images a moment to settle
      const fullShot = await $.ioSaveScreenshot("images", {
        extension: "jpeg",
        full: true,
        wait: 1500
      });
      if (null === fullShot.path) {
        throw new Error(`Full page screenshot failed: ${fullShot.error}`);
      }
      $.log(`Full page is ${fullShot.height} pixels tall`);

      return { next: "evidence" };
  - key: evidence
    code: |
      // Screenshots are cheap - grab one whenever something goes wrong
      try {
        await $.doClick(await $.doQuery("button", { contains: "submit" }));
      } catch (error) {
        const shot = await $.ioSaveScreenshot("images", { full: true, dpr: true });
        $.log(`Click failed, evidence saved to ${shot.path}`, "error");
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: images
    type: files
    name: Screenshots
    desc: ""
    max: 1024
    extensions:
      - png
      - jpeg
```

* * *

#### async $.ioSaveVideo( ioKey, options = {} )

> IO: Record a video of the session and save it to disk.<br/>
> The video is rendered in real time with no sound.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Save options<br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@param</i> {int} <b>options.fps</b> (optional) Frames per second; default <i>20</i>; an integer between <i>1</i> and <i>30</i><br/>
> <i>@param</i> {"av1"|"h264"} <b>options.codec</b> (optional) Video codec; default "av1"; available codecs:<br/>
>  - "av1": better compression<br/>
>  - "h264": wider support across devices<br/>
> <i>@param</i> {boolean} <b>options.dpr</b> (optional) Use Device Pixel Ratio (DPR); default <i>false</i>; output video at true scale, which might be 2:1 instead of 1:1 on MacOS<br/>
> <i>@param</i> {boolean} <b>options.rwp</b> (optional) Record While Paused; default <i>false</i>; continue recording video even when agent is paused<br/>
> <i>@return</i> {function(): { path:(string|null), error: (null|string), width:int, height:int, duration:int}}<br/>
> Returns an async function that stops the page recorder.<br/>
> Calling this function returns an object with final video details.<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key, or trying to record more than one video at a time<br/>

* * *

In the following example we're recording smooth scrolling a web page at 150 pixels per second. Note that `$.ioSaveVideo` returns a callback function that stops the recording.

**example-ioSaveVideo.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Go home
      await $.navLoad("about:home/");

      // Start recording
      const recStop = await $.ioSaveVideo("video");
      
      // Wait, then load the test page
      await $.sleep(1000);
      await $.navLoad("about:home/test/");

      // Smooth-scroll through the entire page
      await $.doScroll(750, { speed: 150 });

      // Log recorded video file path
      const filePath = await recStop();
      $.log(filePath);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: video
    type: files
    name: Recordings
    desc: ""
    max: 512
    extensions:
      - mp4
```

* * *

#### async $.ioSaveUrl( ioKey, url, options = {} )

> IO: Capture the file stored at this URL and save it to disk.<br/>
> 
> Useful for saving files that are not available as links on page.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {string} <b>url</b> URL to download<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Save options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Download timeout in seconds; default <i>600</i><br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@return</i> {string | null} File path on success, <i>null</i> if download failed<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key, or request failed<br/>

* * *

Reach for this when you already know the address of the file you want. It's the counterpart to `$.ioSaveDownload`, which waits for the page to start a download on its own, and to `$.ioSaveRequest`, which is for saving the result of a request you had to shape yourself with headers or a body.  
The URL is resolved against the page currently loaded, so relative paths scraped straight out of `src` or `href` attributes can be passed through unchanged.  
A failed download returns `null` rather than throwing, so a single broken asset doesn't have to end the run. An `ioKey` that isn't a declared files output does throw.

**example-ioSaveUrl.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Save an asset that is never exposed as a link on the page
      const imgPath = await $.ioSaveUrl("images", "http://localhost:7199/img/pages/page-404.png");
      if (null === imgPath) {
        throw new Error("$.ioSaveUrl failed");
      }
      $.log(`Saved to ${imgPath}`, "success");

      // Store it under a different declared extension, and allow longer for a big file
      const jpegPath = await $.ioSaveUrl("images", "http://localhost:7199/img/pages/page-401.png", {
        extension: "jpeg",
        timeout: 120
      });
      $.log(`Saved as ${jpegPath}`);

      return { next: "scrape-gallery" };
  - key: scrape-gallery
    code: |
      await $.navLoad("http://localhost:7199/");

      // Relative URLs are resolved against the page that is currently loaded
      await $.ioSaveUrl("images", "/img/pages/page-404.png");

      // Pull every image the page references
      const imageKeys = await $.doQueryAll("img[src]");
      for (const imageKey of imageKeys) {
        const src = await $.doGetAttribute(imageKey, "src");
        if (null === src) {
          continue;
        }

        const savedPath = await $.ioSaveUrl("images", src);
        if (null === savedPath) {
          $.log(`Skipped ${src}`, "warning");

          continue;
        }

        $.doTick("download");
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: images
    type: files
    name: Images
    desc: ""
    max: 1024
    extensions:
      - png
      - jpeg
```

* * *

#### async $.ioSaveRequest( ioKey, url, options = {} )

> IO: Capture the result of this fetch request and save it to disk.<br/>
> 
> Useful for saving the result of fetch requests made from the current domain/page.<br/>
> For direct access to JSON or text responses, use <i>$.doRequest</i> instead.<br/>
> Keywords: ajax, fetch, request, get, post, push.<br/>
> 
> <i>@param</i> {string} <b>ioKey</b> Files output key<br/>
> <i>@param</i> {string} <b>url</b> URL to save locally<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Request options<br/>
> <i>@param</i> {string} <b>options.method</b> (optional) Request method; default <i>GET</i><br/>
> <i>@param</i> {object} <b>options.data</b> (optional) Request data; default <i>{}</i><br/>
> <i>@param</i> {object} <b>options.headers</b> (optional) Request headers; default <i>{}</i><br/>
> <i>@param</i> {boolean} <b>options.json</b> (optional) JSON request; default <i>true</i><br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Request timeout in seconds; default <i>60</i><br/>
> <i>@param</i> {string} <b>options.extension</b> (optional) File extension; default <i>null</i>; must match one of the extensions declared in output; falls back to first file extension declared in output<br/>
> <i>@return</i> {string | null} File path on success, <i>null</i> if download failed<br/>
> 
> <i>@throws</i> {Error} If <i>ioKey</i> is not a valid output files key, or request failed<br/>

* * *

This example demonstrates how to save a file with a custom extension. Note that the file extension must first be declared in the output configuration. If the specified extension is not included in the declared list, the first listed extension, "json" in this case, will be used instead.  
If you don't specify a file extension, the script will attempt to deduce it from the URL.

**example-ioSaveRequest.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const url = "http://localhost:7199/manifest.json";

      // Navigate to origin so the browser allows the request (CORS)
      await $.navLoad(new URL(url).origin);

      $.log("Saving JSON as simple text file...");
      const jsonPath = await $.ioSaveRequest("manifest", url, { extension: "txt" });
      if ("string" !== typeof jsonPath) {
        throw new Error("$.ioSaveRequest failed");
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: manifest
    type: files
    name: JSON files
    desc: ""
    max: 1024
    extensions:
      - json
      - txt
```

* * *

#### async $.navLoad( url, options = {} )

> Navigation: Open URL and wait for the page to load (DOM ready).<br/>
> 
> Keywords: navigate to page, navigate to url, load page, visit page, load url, visit url.<br/>
> 
> <i>@param</i> {string} <b>url</b> URL; only <i>http</i> and <i>https</i> protocols are allowed<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Navigation options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Navigation timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>
> 
> <i>@throws</i> {Error} If page load failed<br/>

* * *

`$.navLoad` resolves as soon as the DOM is ready, not when every image and script has finished downloading. If the page you're automating renders its content later, follow the call with `$.doAwaitPresent` or `$.doAwaitVisible` instead of raising the timeout.  
A page that never reaches DOM ready within the timeout throws, so wrap navigation to third party sites in a `try/catch` when a single unreachable URL shouldn't stop the whole agent.  
The URL is resolved against the address currently loaded, so a relative path such as `"/account/settings"` works once you're already on the right origin.

**example-navLoad.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Open the home page and wait for DOM ready
      await $.navLoad("about:home/");

      // Give a slow page a shorter leash than the default 60 seconds
      await $.navLoad("about:home/test/", { timeout: 15 });

      // Confirm we landed where we expected to
      const url = await $.navGetUrl();
      const title = await $.navGetTitle();
      $.log(`Loaded "${title}" at ${url}`, "success");

      return { next: "risky-page" };
  - key: risky-page
    code: |
      // A page that may be down, slow, or blocked - don't let it kill the run
      try {
        await $.navLoad("https://example.com/", { timeout: 10 });
        $.log("Third party page is up", "success");
      } catch (error) {
        $.log(`Navigation failed: ${error.message}`, "warning");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.navReload( options = {} )

> Navigation: Reload the current page.<br/>
> 
> <i>@param</i> {Object} <b>options</b> (optional) Reload options<br/>
> <i>@param</i> {boolean} <b>options.skipCache</b> (optional) Reload skipping the cache; default <i>false</i><br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Reload timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>
> 
> <i>@throws</i> {Error} If page reload failed<br/>

* * *

Reloading keeps the current address and history entry, which is what separates it from calling `$.navLoad` with the same URL. Forward and back still work afterwards, and a URL carrying state in its query string or fragment is preserved exactly.  
`skipCache` is worth reaching for when the markup looks stale rather than wrong - a served-from-cache page can be minutes old. It costs a full re-download, so leave it off in a retry loop that runs often.  
Like the other navigation methods, a reload that never completes throws, and a page holding unsaved input may raise a `beforeunload` dialog first. Lower the timeout when that's a possibility so a blocked reload surfaces quickly.

**example-navReload.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Plain reload - same URL, same history entry
      await $.navReload();
      $.log(`Still on ${await $.navGetUrl()}`);

      // Bypass the cache when stale assets are the problem
      await $.navReload({ skipCache: true, timeout: 30 });

      return { next: "retry" };
  - key: retry
    code: |
      // A reload is the cheapest fix for a page that rendered badly
      // or never finished populating
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (await $.doAwaitPresent("[data-role=row]", { timeout: 10 })) {
          $.log(`Rows appeared on attempt ${attempt}`, "success");

          return;
        }

        $.log(`Nothing rendered, reloading (${attempt}/3)`, "warning");
        await $.navReload({ skipCache: true });
      }

      $.stop("The page never rendered its rows.");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.navGoBack( options = {} )

> Navigation: Go backwards.<br/>
> 
> <i>@param</i> {Object} <b>options</b> (optional) Navigation options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Navigation timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>
> 
> <i>@throws</i> {Error} If page navigation failed<br/>

* * *

This walks the session history the same way the browser's back button does, which makes it the natural way to return to a listing after visiting one of its results - cheaper than reloading the listing by URL, and it keeps whatever scroll position and state the page had.  
The return value is what tells you the step actually happened, so it's worth checking rather than assuming: a navigation that fails outright throws, but a call with nowhere left to go reports `false`.  
A page holding unsaved input may raise a `beforeunload` dialog on the way out. Give the call a shorter `timeout` when that's a possibility, so a blocked navigation surfaces quickly instead of stalling the run for a minute.

**example-navGoBack.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      // Build up some session history
      await $.navLoad("about:home/");
      await $.navLoad("about:home/test/");

      // Step back one entry
      await $.navGoBack();
      $.log(`Back on ${await $.navGetUrl()}`, "success");

      // Keep stepping back until there's nowhere left to go
      while (await $.navGoBack({ timeout: 10 })) {
        $.log(`Now on ${await $.navGetUrl()}`);
      }

      $.log("Reached the start of the history", "warning");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.navGoForth( options = {} )

> Navigation: Go forwards.<br/>
> 
> <i>@param</i> {Object} <b>options</b> (optional) Navigation options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Navigation timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>
> 
> <i>@throws</i> {Error} If page navigation failed<br/>

* * *

The mirror image of `$.navGoBack`, and only meaningful after one: there is no forward entry until something has gone backwards first.  
Forward history is fragile. As in any browser, stepping back and then loading a new URL discards whatever was ahead, so a `$.navLoad` between the two calls will leave nothing to return to. Check the return value rather than assuming the step happened.

**example-navGoForth.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/");
      await $.navLoad("about:home/test/");

      // Step back, peek at the previous page, then return
      await $.navGoBack();
      $.log(`After going back: ${await $.navGetUrl()}`);

      await $.navGoForth();
      $.log(`After going forward: ${await $.navGetUrl()}`, "success");

      return { next: "lost-history" };
  - key: lost-history
    code: |
      // Step back, then navigate somewhere new - this drops the forward entry
      await $.navGoBack();
      await $.navLoad("about:home/");

      if (!(await $.navGoForth({ timeout: 10 }))) {
        $.log("Nothing to go forward to", "warning");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.navGetUrl()

> Navigation: Get the URL of the web page.<br/>
> 
> <i>@return</i> {string}<br/>

* * *

The URL you pass to `$.navLoad` is not always the URL you end up on: sites redirect, append trailing slashes, add tracking parameters, or bounce you to a login page. Read the address back before deciding what to do next.  
The returned string is a full absolute URL, so it can be handed straight to `new URL()` when you only need the origin or the pathname.

**example-navGetUrl.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Where did we actually end up?
      const currentUrl = await $.navGetUrl();
      $.log(`Landed on ${currentUrl}`);

      // Branch on the path rather than on what we asked for
      if (currentUrl.match(/\/home\/test\/?$/)) {
        $.log("We're on the test page", "success");

        return { next: "scrape" };
      }

      // Redirected to a login wall, a consent page, or an error
      $.log("Unexpected page, nothing to scrape here", "warning");
  - key: scrape
    code: |
      // Keep the origin so relative links can be resolved later
      const { origin } = new URL(await $.navGetUrl());
      $.log(`Working within ${origin}`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.navGetTitle()

> Navigation: Get the title of the web page.<br/>
> 
> <i>@return</i> {string}<br/>

* * *

Titles are useful for two things: confirming a page is the one you asked for, and noticing that a single page app has navigated without a full page load.  
Bear in mind the title can be rewritten by scripts after DOM ready, so read it once the content you care about is actually on screen.

**example-navGetTitle.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // The title is the cheapest way to sanity check a page
      const pageTitle = await $.navGetTitle();
      $.log(`Page title: ${pageTitle}`);

      // Many sites answer with 200 OK and an error page
      if (pageTitle.match(/^(404|403|not found|error)/i)) {
        $.log("Served an error page, giving up on this URL", "warning");

        return;
      }

      $.log("Page looks right, carrying on", "success");
      return { next: "wait-for-title" };
  - key: wait-for-title
    code: |
      // Single page apps swap the title instead of reloading,
      // so poll it to know when the view has changed
      const titleBefore = await $.navGetTitle();
      await $.doClick(await $.doQuery("a", { contains: "buttons" }));

      for (let i = 0; i < 10; i++) {
        if (titleBefore !== (await $.navGetTitle())) {
          $.log("The view has changed", "success");

          return;
        }

        await $.sleep(500);
      }

      $.log("Title never changed, the click may not have registered", "warning");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.handleAlert()

> Browser: Prevent the next <i>window.alert()</i> from bubbling.<br/>
> 
> Unhandled alert dialogs are automatically closed,<br/>
> and their message is passed as a toast notification.<br/>

* * *

Each call arms a guard for a single dialog and then steps aside, so a page that raises three alerts needs three calls. Arm it before the action that triggers the dialog, never after.  
An alert nobody handled won't stall the run - it's closed automatically and its message surfaces as a toast. Handling it explicitly is about the alerts you already know are coming, so an expected dialog doesn't get reported as if something had gone wrong.  
For the other two dialog types, use `$.handleConfirm` and `$.handlePrompt`. Note that these cover the browser's own `window.alert` family only - a modal the page draws in HTML is just markup, so dismiss it with `$.doClick`.

**example-handleAlert.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Disarm the dialog before the click that raises it
      await $.handleAlert();
      await $.doClick(await $.doQuery('[data-role="alert"]'));

      // The guard covers exactly one dialog, so a second alert
      // needs a second call
      await $.handleAlert();
      await $.doClick(await $.doQuery('[data-role="alert"]'));

      $.log("Both alerts handled", "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.handleConfirm( accept = true )

> Browser: Prevent the next <i>window.confirm()</i> from bubbling, and either accept or reject it.<br/>
> 
> Unhandled confirmation dialogs are automatically accepted,<br/>
> and their message is passed as a toast notification.<br/>
> 
> <i>@param</i> {boolean} <b>accept</b> (optional) Accept or reject the next confirmation message; default <i>true</i><br/>

* * *

Left alone, a confirmation dialog is accepted on your behalf. That's convenient for cookie notices and harmless enough most of the time, but it means an accidental click on something destructive goes through without resistance.  
Passing `false` is the interesting case: it lets a module click the button and still cancel, which is exactly what a dry run wants. The value can be computed, as above, so the same code path serves both modes.  
One dialog per call, armed before the click that raises it.

**example-handleConfirm.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const confirmButton = await $.doQuery('[data-role="confirm"]');
      const resultKey = await $.doQuery('[data-role="confirm-result"]');

      // Accept the next confirmation
      await $.handleConfirm();
      await $.doClick(confirmButton);
      $.log(`The page received: ${await $.doGetContent(resultKey)}`);

      // Reject the one after that
      await $.handleConfirm(false);
      await $.doClick(confirmButton);
      $.log(`The page received: ${await $.doGetContent(resultKey)}`);

      return { next: "guarded-delete" };
  - key: guarded-delete
    code: |
      // Rejecting matters more than accepting: an unhandled confirmation
      // is accepted for you, which is the wrong default for a dry run
      const dryRun = $.ioInputBoolean("dry-run");

      const deleteKey = await $.doQuery("button", { contains: "delete" });
      if (null === deleteKey) {
        return;
      }

      await $.handleConfirm(!dryRun);
      await $.doClick(deleteKey);

      $.log(dryRun ? "Deletion cancelled" : "Deletion confirmed", dryRun ? "warning" : "success");
srcFunctions: []
srcInputs:
  - key: dry-run
    type: boolean
    name: Dry run
    desc: Cancel destructive confirmations instead of accepting them
srcOutputs: []
```

* * *

#### async $.handlePrompt( response = "" )

> Browser: Prevent the next <i>window.prompt()</i> from bubbling, and answer it.<br/>
> 
> Unhandled prompts automatically return with their default value or an empty string,<br/>
> and their message is passed as a toast notification.<br/>
> 
> <i>@param</i> {string} <b>response</b> (optional) Prompt response text<br/>

* * *

A prompt left unhandled returns its default value, or an empty string when it has none, and the message is reported as a toast. That's rarely what the page was waiting for, so any prompt that gates real work needs an answer queued in advance.  
Queue it before the click, not after - the guard covers the next prompt only, and by the time the dialog is open it's too late to decide what to say.  
Passing an empty string answers with an empty string, which is a different thing from leaving the prompt unhandled. Sites that treat blank as a valid response will accept it.

**example-handlePrompt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Queue the answer, then trigger the prompt
      await $.handlePrompt("foo");
      await $.doClick(await $.doQuery('[data-role="prompt"]'));

      const answer = await $.doGetContent(await $.doQuery('[data-role="prompt-result"]'));
      if ("foo" !== answer) {
        throw new Error(`The page received "${answer}" instead`);
      }

      $.log("Prompt answered", "success");

      return { next: "answer-from-input" };
  - key: answer-from-input
    code: |
      // The answer usually comes from somewhere else - an input,
      // a table row, or a value carried over from an earlier state
      const code = $.ioInputString("code");

      await $.handlePrompt(code);
      await $.doClick(await $.doQuery('[data-role="prompt"]'));

      $.log(`Answered the prompt with ${code.length} characters`);
srcFunctions: []
srcInputs:
  - key: code
    type: string
    name: Confirmation code
    desc: Sent as the answer to the page's prompt
    max: 64
    default: uindow
srcOutputs: []
```

* * *

#### async $.doQuery( selector, options = {} )

> Document: Find the first HTML element that matches the CSS selector and return its corresponding <i>element key</i>.<br/>
> 
> <i>@param</i> {string} <b>selector</b> CSS selector<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.parent</b> (optional) Parent CSS selector OR element key; default <i>null</i> to search the entire Document<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by element (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to elements that have active scrollbars; default <i>false</i><br/>
> <i>@param</i> {boolean} <b>options.viewportDown</b> (optional) Restrict results to elements placed in the viewport and below it; default <i>false</i><br/>
> <i>@return</i> {string|null} 24 characters long <i>element key</i> or <i>null</i> on error<br/>

* * *

A match returns a 24 character element key, which every `$.do*` method accepts in place of a selector. Reusing the key saves the page a second lookup, and it stays pointed at the same element even if later changes would make the original selector ambiguous.  
Nothing found is `null`, not an error, so check the result whenever the element may legitimately be absent - passing `null` on to a method like `$.doClick` is what will actually throw.  
`contains` matches case insensitively against the element's text, which is often steadier than a structural selector on markup you don't control. `parent` scopes the search to a subtree, and `scrollable` and `viewportDown` filter by scrollbars and position respectively.

**example-doQuery.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // A plain CSS selector returns the first match
      const headingKey = await $.doQuery("h1");
      $.log(await $.doGetContent(headingKey));

      // Narrow it down by the text the element contains
      const fooButton = await $.doQuery(".MuiButton-root", { contains: "foo" });
      if (null === fooButton) {
        throw new Error("No 'foo' button on this page");
      }
      await $.doClick(fooButton);

      return { next: "scoped" };
  - key: scoped
    code: |
      // Restrict the search to one subtree instead of the whole document
      const switchKey = await $.doQuery("input[name='s1'][value='1']");
      const groupKey = await $.doQueryParent(switchKey, { selector: "div", contains: "Switches" });

      const firstCheckbox = await $.doQuery("input[type='checkbox']", { parent: groupKey });
      $.log(await $.doGetAttribute(firstCheckbox, "value"));

      // Skip anything already scrolled past
      const nextSection = await $.doQuery("h2", { viewportDown: true });
      if (null !== nextSection) {
        await $.doScrollTo(nextSection);
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doQueryAll( selector, options = {} )

> Document: Find all HTML elements that match the CSS selector and return their corresponding <i>element keys</i>.<br/>
> 
> <i>@param</i> {string} <b>selector</b> CSS selector<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.parent</b> (optional) Parent CSS selector OR element key; default <i>null</i> to search the entire Document<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by element (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to elements that have active scrollbars; default <i>false</i><br/>
> <i>@param</i> {boolean} <b>options.viewportDown</b> (optional) Restrict results to elements placed in the viewport and below it; default <i>false</i><br/>
> <i>@return</i> {string[]} Array of 24 characters long <i>element keys</i><br/>

* * *

Unlike `$.doQuery`, this always hands back an array - an empty one when nothing matches - so there's no null check to forget. Test `length` when an empty page is worth reporting.  
Pairing it with the `parent` option is the standard way to scrape repeated markup: collect the row containers here, then run narrow queries inside each one. That keeps the per-row selectors short and stops a query from wandering into a neighbouring row.  
All the filters from `$.doQuery` apply, and `contains` is often the quickest way to keep only the rows that mention something you care about.

**example-doQueryAll.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Every match, in document order
      const headingKeys = await $.doQueryAll("h2");
      $.log(`Found ${headingKeys.length} sections`);

      for (const headingKey of headingKeys) {
        $.log(await $.doGetContent(headingKey));
      }

      return { next: "scrape-rows" };
  - key: scrape-rows
    code: |
      // The usual shape of a scrape: find the repeated container,
      // then query inside each one with { parent }
      const rowKeys = await $.doQueryAll("[data-role=row]");
      if (!rowKeys.length) {
        $.log("Nothing to scrape on this page", "warning");

        return;
      }

      for (const rowKey of rowKeys) {
        const nameKey = await $.doQuery(".name", { parent: rowKey });
        const linkKey = await $.doQuery("a[href]", { parent: rowKey });
        if (null === nameKey || null === linkKey) {
          continue;
        }

        await $.ioOutputRow("items", {
          name: await $.doGetContent(nameKey),
          url: (await $.doGetAttribute(linkKey, "href")) ?? ""
        });

        $.doTick("collect");
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: items
    type: table
    name: Scraped items
    desc: ""
    columns:
      - name
      - url
```

* * *

#### async $.doQueryParent( element, options = {} )

> Document: Find the parent of this HTML element that matches the CSS selector and return its corresponding <i>element key</i>.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.selector</b> (optional) CSS selector for parent element; default <i>null</i> to stop at first ancestor<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by parent element (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to parent elements that have active scrollbars; default <i>false</i><br/>
> <i>@return</i> {string|null} 24 characters long <i>element key</i> or <i>null</i> on error<br/>

* * *

Selectors only ever point downwards, which is awkward when the element you can reliably identify is a leaf and the data you want lives on its siblings. Climbing to a shared container and querying down from there is the way around it.  
That pairs naturally with the `parent` option on `$.doQuery`: climb once to establish scope, then run narrow queries inside it. The result is far steadier than a long descendant selector that breaks the moment a wrapper is added.  
`contains` matches text anywhere inside the ancestor, which on an outer container will match almost anything - combine it with `selector` to keep the climb from overshooting. No match returns `null`.

**example-doQueryParent.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const switchKey = await $.doQuery("input[name='s1'][value='1']");

      // With no selector, you get the immediate ancestor
      const firstParent = await $.doQueryParent(switchKey);
      $.log(await $.doGetAttribute(firstParent, "class"));

      // With one, it climbs until something matches
      const groupKey = await $.doQueryParent(switchKey, { selector: "div", contains: "Switches" });
      if (null === groupKey) {
        throw new Error("Could not find the enclosing group");
      }

      $.log(`Group: ${await $.doGetAttribute(groupKey, "data-stack")}`);

      return { next: "climb-to-row" };
  - key: climb-to-row
    code: |
      // The usual shape: find the one thing you can identify,
      // then climb to the container holding everything you want
      const priceKey = await $.doQuery("[data-role=price]", { contains: "99" });
      if (null === priceKey) {
        $.log("No matching price on this page", "warning");

        return;
      }

      const rowKey = await $.doQueryParent(priceKey, { selector: "[data-role=row]" });
      if (null === rowKey) {
        return;
      }

      // Now query downwards again, scoped to that row
      const nameKey = await $.doQuery(".name", { parent: rowKey });
      $.log(await $.doGetContent(nameKey));
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doQuerySiblings( element, options = {} )

> Document: Find the siblings of this HTML element that match the CSS selector and return their corresponding <i>element keys</i>.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.selector</b> (optional) CSS selector for sibling elements; default <i>null</i> to match all siblings<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by sibling elements (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to sibling elements that have active scrollbars; default <i>false</i><br/>
> <i>@return</i> {string[]} 24 characters long <i>element keys</i><br/>

* * *

Siblings answer the questions a downward selector can't phrase: the other options in this group, the cells beside this one, the rows around the one that matched. The starting element is excluded, so the count is "the others" rather than "all of them".  
It returns an array, empty when nothing matches, so there's no `null` to guard against - unlike `$.doQueryParent`, which returns a single key or nothing.  
Which element you start from decides what counts as a sibling. Climbing to the wrapper first, as above, usually gives the set you meant - starting from the raw input would return the pieces of that one control instead.

**example-doQuerySiblings.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const switchKey = await $.doQuery("input[name='s1'][value='1']");
      const switchRoot = await $.doQueryParent(switchKey, { selector: ".MuiSwitch-root" });

      // The element you started from is never included in the result
      const siblingKeys = await $.doQuerySiblings(switchRoot);
      $.log(`${siblingKeys.length} sibling switches`);

      for (const siblingKey of siblingKeys) {
        const checkboxKey = await $.doQuery("input[type='checkbox']", { parent: siblingKey });
        if (null === checkboxKey) {
          continue;
        }

        $.log(`Sibling value: ${await $.doGetAttribute(checkboxKey, "value")}`);
      }

      return { next: "narrow" };
  - key: narrow
    code: |
      const switchKey = await $.doQuery("input[name='s1'][value='1']");
      const switchRoot = await $.doQueryParent(switchKey, { selector: ".MuiSwitch-root" });

      // Narrow by selector, or by the text the sibling contains
      const labelKeys = await $.doQuerySiblings(switchRoot, { selector: "label" });
      $.log(`${labelKeys.length} labels alongside it`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doQueryAt( left, top, options = {} )

> Document: Find the first HTML element that matches the CSS selector at the specified coordinates,<br/>
> and return its corresponding <i>element key</i>.<br/>
> 
> <i>@param</i> {int} <b>left</b> Left coordinate in pixels<br/>
> <i>@param</i> {int} <b>top</b> Top coordinate in pixels<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.selector</b> (optional) CSS selector for top element; default <i>null</i> to stop at first ancestor<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by element (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to elements that have active scrollbars; default <i>false</i><br/>
> <i>@return</i> {string|null} <i>24 characters long element key</i> or <i>null</i> on error<br/>

* * *

This is the inverse of `$.doGetBox`: instead of asking where an element is, it asks what is at a place. That makes it the sanity check for coordinate work - confirm what a `$.doClickAt` would land on before firing it, rather than discovering afterwards that a sticky header was in the way.  
Without `selector` you get whatever is on top at that point, which on a nested layout is often an inner wrapper. Passing a selector climbs to the first matching ancestor instead, so you can ask for the `button` rather than the span inside it.  
Coordinates are viewport-relative and must be non-negative integers; anything else returns `null` without throwing.

**example-doQueryAt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // What is sitting at this point in the viewport?
      const elementKey = await $.doQueryAt(50, 20);
      if (null === elementKey) {
        $.log("Nothing at that point", "warning");

        return;
      }

      $.log(`Found a <${await $.doGetTag(elementKey)}>`);

      // The topmost element is often a wrapper or an overlay.
      // A selector climbs to the ancestor you actually meant.
      const buttonKey = await $.doQueryAt(50, 20, { selector: "button" });
      $.log(null === buttonKey ? "Not inside a button" : "Inside a button");

      return { next: "follow-pointer" };
  - key: follow-pointer
    code: |
      // Check what a coordinate click would hit before committing to it
      await $.doHoverAt(400, 400);

      const { left, top } = await $.doGetMouse();
      const targetKey = await $.doQueryAt(left, top);
      if (null === targetKey) {
        $.log("The pointer is over empty space", "warning");

        return;
      }

      $.log(await $.doGetContent(targetKey));
      await $.doClickAt(left, top);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doRequest( url, options = {} )

> Document: Make a request from the current page.<br/>
> 
> Useful for JSON and simple text responses. For large files or binary data use <i>$.ioSaveRequest</i> instead.<br/>
> If you need to bypass CORS and send the requests directly from the computer (outside of the browser session) use <i>$.osRequest</i> instead.<br/>
> Keywords: ajax, fetch, request, get, post, push.<br/>
> 
> <i>@param</i> {string} <b>url</b> Request URL<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Request options<br/>
> <i>@param</i> {string} <b>options.method</b> (optional) Request method; default <i>GET</i><br/>
> <i>@param</i> {object} <b>options.data</b> (optional) Request data; default <i>{}</i><br/>
> <i>@param</i> {object} <b>options.headers</b> (optional) Request headers; default <i>{}</i><br/>
> <i>@param</i> {boolean} <b>options.json</b> (optional) JSON request; default <i>true</i><br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Request timeout in seconds; default <i>60</i><br/>
> <i>@param</i> {boolean} <b>options.resData</b> (optional) Parse and return the response data; default <i>true</i><br/>
> <i>@return</i> {{ ok:boolean, status:number, headers:object, data:mixed}} Response object<br/>
> 
> <i>@throws</i> {Error} If request failed<br/>

* * *

This example describes how to fetch data in the browser when CORS is an issue.  
If you don't care about cookies you can use [$.osRequest()] to bypass CORS instead.

**example-doRequest.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      const url = "http://localhost:7199/manifest.json";

      // Navigate to origin so the browser allows the request (CORS)
      await $.navLoad(new URL(url).origin);

      // JSON request
      $.log(`Fetching ${url} from browser`, "success");
      const response = await $.doRequest(url);
      $.log([response?.status, response?.headers, response?.data]);

      // Fetch headers only
      $.log(`Fetching ${url} without data from browser`, "success");
      const responseNoData = await $.doRequest(url, { resData: false });
      $.log([responseNoData?.status, responseNoData?.headers, responseNoData?.data]);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### $.doTick( name, amount = 1 )

> Document: Increment a named counter in the Status bar.<br/>
> Up to 5 counters can be displayed at a time.<br/>
> 
> <i>@param</i> {string} <b>name</b> Counter name. The following strings are displayed as icons:<br/>
>  "contact", "view", "like", "post", "repost", "comment",<br/>
>  "upload", "download", "screenshot", "collect",<br/>
>  "success", "warning"<br/>
> <i>@param</i> {int} <b>amount</b> (optional) Strictly positive number; <i>[0,1000]</i>; default <i>1</i>; <i>0</i> won't increment the counter<br/>

* * *

Logs scroll away and a run that prints one line per item quickly becomes unreadable. A counter stays put and keeps climbing, which makes it much easier to tell at a glance whether an agent is working or stuck.  
The names listed above are drawn as icons; anything else appears as its own label, so a module can invent counters that suit its own work. Only five are shown at a time, so pick a handful of things worth counting rather than ticking everything.  
The amount is clamped to between 0 and 1000, and 0 is a no-op rather than an error - convenient when the increment is computed from something that might turn out to be empty.

**example-doTick.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Counters are the cheapest progress signal in a long run
      const rowKeys = await $.doQueryAll("[data-role=row]");
      for (const rowKey of rowKeys) {
        await $.ioOutputRow("items", { name: await $.doGetContent(rowKey) });

        // No await - ticking is synchronous
        $.doTick("collect");
      }

      return { next: "named-counters" };
  - key: named-counters
    code: |
      // These names render as icons rather than text
      $.doTick("screenshot");
      $.doTick("download", 3);
      $.doTick("success");

      // Anything else is shown as a plain label
      $.doTick("pages");

      // An amount of 0 is accepted but changes nothing
      $.doTick("collect", 0);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: items
    type: table
    name: Collected items
    desc: ""
    columns:
      - name
```

* * *

#### async $.doHighlight( element, options = {} )

> Document: Highlight an HTML element in the viewport for 1 second.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Highlight options<br/>
> <i>@param</i> {boolean} <b>options.scroll</b> (optional) Scroll element into view before highlighting; default <i>true</i><br/>
> <i>@param</i> {boolean} <b>options.hover</b> (optional) Move mouse over the center of the element after scrolling into view; default <i>true</i><br/>

* * *

The highlight is drawn over the agent's viewport and never touches the page, so nothing you highlight is modified and no handler on the page fires because of it.  
Each call waits out the full animation, a little over a second, before returning. That's the point when you're recording with `$.ioSaveVideo` or watching an agent to see why a selector went wrong - and the reason to leave it out of loops that just need to get work done.  
By default the element is scrolled into view and the mouse moves to its center. Pass `{ scroll: false, hover: false }` to draw the box without disturbing either. To highlight an area that isn't an element, use `$.doHighlightBox` with a box from `$.doGetBox`.

**example-doHighlight.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Show what the agent is about to touch before it touches it
      const inputKey = await $.doQuery("[name=input-textfield]");
      await $.doHighlight(inputKey);
      await $.doType(inputKey, "uindow", { replace: true });

      // Already on screen, and the mouse is needed elsewhere
      await $.doHighlight("h1", { scroll: false, hover: false });

      return { next: "tour" };
  - key: tour
    code: |
      // Walking a set of matches makes a recording much easier to follow
      const headingKeys = await $.doQueryAll("h2");
      for (const headingKey of headingKeys) {
        await $.doHighlight(headingKey);
      }

      $.log(`Highlighted ${headingKeys.length} sections`, "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doHighlightBox( box )

> Document: Highlight a box in the viewport for 1 second.<br/>
> 
> <i>@param</i> {Object} <b>box</b> Rectangle details; obtained with <i>$.doGetBox</i><br/>
> <i>@param</i> {int} <b>box.left</b> Left coordinate in pixels<br/>
> <i>@param</i> {int} <b>box.top</b> Top coordinate in pixels<br/>
> <i>@param</i> {int} <b>box.width</b> Width in pixels<br/>
> <i>@param</i> {int} <b>box.height</b> Height in pixels<br/>

* * *

Where `$.doHighlight` takes an element and does the work around it - scrolling it into view, moving the pointer to it - this takes four numbers and draws exactly that rectangle. Nothing is scrolled and nothing is hovered, so the coordinates need to be on screen already.  
It also returns immediately rather than waiting out the animation, which `$.doHighlight` does. Add your own `$.sleep` when you want the box to be seen before the next one is drawn - otherwise a run of highlights will overwrite each other faster than anyone can follow.  
A box narrower or shorter than two pixels is skipped, so a degenerate rectangle produces no error and no output. Like `$.doHighlight`, the overlay is drawn over the agent's viewport and never touches the page.

**example-doHighlightBox.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const box = await $.doGetBox("[name=input-textfield]");
      if (null === box) {
        return;
      }

      // A box from $.doGetBox can be passed straight through
      await $.doHighlightBox(box);
      await $.sleep(1200);

      // Or adjusted to point at part of an element
      await $.doHighlightBox({ left: box.left, top: box.top, width: 50, height: 50 });
      await $.sleep(1200);

      // Boxes thinner than 2px in either direction are not drawn at all
      await $.doHighlightBox({ left: box.left, top: box.top, width: 1, height: 1 });

      return { next: "region" };
  - key: region
    code: |
      // The box doesn't have to correspond to an element - here we mark
      // the top third of the viewport before capturing it
      const viewport = await $.doGetViewport();

      await $.doHighlightBox({
        left: 0,
        top: 0,
        width: viewport.width,
        height: Math.round(viewport.height / 3)
      });

      await $.sleep(1200);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetMouse()

> Document: Get mouse position.<br/>
> 
> <i>@return</i> {{ left: int, top: int}}<br/>

* * *

Coordinate methods such as `$.doHoverAt`, `$.doClickAt` and `$.doTypeAt` take absolute viewport coordinates. `$.doGetMouse` is what lets you work relative to the current pointer instead, which is handy for drag-like gestures, nudging along a slider, or resuming a movement in a later state.  
Positions are relative to the viewport, not the document, so they change meaning after a scroll. Pair it with `$.doQueryAt` when you want to know what is actually underneath the pointer.

**example-doGetMouse.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Park the pointer in the middle of the viewport
      const viewport = await $.doGetViewport();
      await $.doHoverAt(viewport.width / 2, viewport.height / 2);

      // Read it back
      const { left, top } = await $.doGetMouse();
      $.log(`Mouse is at ${left} x ${top}`);

      // Walk it to the right in small steps, relative to wherever it is now
      for (let i = 0; i < 5; i++) {
        const position = await $.doGetMouse();
        await $.doHoverAt(position.left + 40, position.top);
        await $.sleep(200);
      }

      const moved = await $.doGetMouse();
      $.log(`Mouse travelled ${moved.left - left} pixels`, "success");

      return { next: "inspect" };
  - key: inspect
    code: |
      // Mouse position carries across states, so you can pick up where you left off
      const { left, top } = await $.doGetMouse();

      // What is sitting under the pointer right now?
      const elementKey = await $.doQueryAt(left, top);
      if (null === elementKey) {
        $.log("Nothing under the pointer", "warning");

        return;
      }

      $.log(`Hovering a <${await $.doGetTag(elementKey)}> element`, "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetBox( element )

> Document: Get the box of an HTML element.<br/>
> 
> <i>@typedef</i> {Object} Box<br/>
> <i>@property</i> {int} <b>left</b> Left coordinate (px)<br/>
> <i>@property</i> {int} <b>top</b> Top coordinate (px)<br/>
> <i>@property</i> {int} <b>width</b> Width of border-box, including padding and borders (px)<br/>
> <i>@property</i> {int} <b>height</b> Height of border-box, including padding and borders (px)<br/>
> <i>@property</i> {int} <b>scrollLeft</b> Distance of scrolled content from the left (px)<br/>
> <i>@property</i> {int} <b>scrollTop</b> Distance of scrolled content from the top (px)<br/>
> <i>@property</i> {int} <b>scrollWidth</b> Total width of content inside element, including overflow (px)<br/>
> <i>@property</i> {int} <b>scrollHeight</b> Total height of content inside element, including overflow (px)<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {Box|null} Element box or <i>null</i> on error<br/>

* * *

The box is where an element sits in the viewport right now, which makes it the bridge to the coordinate methods - `$.doClickAt`, `$.doTypeAt`, `$.doHoverAt`, `$.doHighlightBox`. That's the way in when you need to hit a specific point inside an element rather than its center, such as a position along a slider.  
Because the numbers are viewport-relative they go stale the moment the page scrolls, so read the box immediately before you use it rather than holding on to one across states.  
The scroll fields describe the element's own overflow: comparing `scrollHeight` against `height` tells you whether it has more content than it's showing, which is how you find the inner panels that scroll independently of the page.

**example-doGetBox.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const inputKey = await $.doQuery("[name=input-text]");
      const box = await $.doGetBox(inputKey);
      if (null === box) {
        throw new Error("$.doGetBox failed");
      }

      $.log(`${box.width}x${box.height} at ${box.left},${box.top}`);

      // Coordinates are viewport-relative, so they feed the *At methods directly
      await $.doTypeAt(box.left + box.width / 2, box.top + box.height / 2, "baz", {
        replace: true
      });

      // Highlight a region of your own choosing
      await $.doHighlightBox({ left: box.left, top: box.top, width: 50, height: 50 });

      return { next: "detect-inner-scroll" };
  - key: detect-inner-scroll
    code: |
      // scrollHeight larger than height means the element holds more
      // than it can show - a panel that scrolls on its own
      const listBox = await $.doGetBox("[data-role=long-list]");
      if (null === listBox) {
        return;
      }

      if (listBox.scrollHeight > listBox.height) {
        $.log(`List shows ${listBox.height}px of ${listBox.scrollHeight}px`, "warning");

        // Wheel events land wherever the pointer is
        await $.doHover("[data-role=long-list]");
        await $.doScroll(listBox.scrollHeight - listBox.height);
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetSelector( elKey )

> Document: Generate an optimal CSS selector for an HTML element.<br/>
> 
> <i>@param</i> {string} <b>elKey</b> <i>Element key</i> obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {string|null} CSS selector or <i>null</i> on error<br/>

* * *

Note the asymmetry with the rest of the `$.do*` family: those accept either a CSS selector or an element key, but this one takes an element key only. It converts in one direction, from a match you've already made into a selector describing it.  
That's useful in two situations. While building a module, log the selector for an element you found by text or position, and paste the result into your source as a faster, more explicit query. At runtime, hand the selector to another state, since a plain string survives being stored with `$.globalRunSet` or `$.globalEnvSet`.  
The selector is generated from the page as it looks right now. Markup that changes between visits - hashed class names, generated ids, position-dependent paths - can produce a selector that won't match later.

**example-doGetSelector.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Matching on visible text is convenient, but the text may be
      // translated, reworded, or simply slow to find on a large page
      const buttonKey = await $.doQuery(".MuiButton-root", { contains: "foo" });
      if (null === buttonKey) {
        throw new Error("Could not find the 'foo' button");
      }

      // Turn the match into a plain CSS selector
      const selector = await $.doGetSelector(buttonKey);
      $.log(`Matched: ${selector}`);

      // Selectors are ordinary strings, so they can be stored
      $.globalRunSet("action-button", selector);

      return { next: "reuse" };
  - key: reuse
    code: |
      const selector = $.globalRunGet("action-button");
      if (null === selector) {
        return;
      }

      // Every $.do* method takes a CSS selector wherever it takes an element key
      await $.doHighlight(selector);
      await $.doClick(selector);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetTag( element )

> Document: Get the tag name of an HTML element.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {string|null} Element tag name or <i>null</i> on error<br/>

* * *

Tag names are returned lowercase, so they compare cleanly against string literals without normalising them first.  
The two places this earns its keep are checking coordinate lookups - `$.doQueryAt` returns whatever sits at a point, which may be a wrapper or an overlay rather than the control you meant - and writing form fillers that work across sites, where the same logical field is an `<input>` on one page and a `<select>` on the next.  
The tag alone doesn't tell you the kind of input, since `<input>` covers text, checkbox, radio and file. Read the `type` attribute with `$.doGetAttribute` when that matters.

**example-doGetTag.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Coordinate lookups return whatever happens to be on top,
      // so it's worth confirming what you actually got
      await $.doHoverAt(50, 20);
      const elementKey = await $.doQueryAt(50, 20);
      if (null !== elementKey) {
        $.log(`Under the pointer: <${await $.doGetTag(elementKey)}>`);
      }

      return { next: "fill-field" };
  - key: fill-field
    code: |
      // Filling a form generically means each field needs the right method
      const fieldKey = await $.doQuery("[name=input-text]");
      if (null === fieldKey) {
        return;
      }

      // Tag names come back lowercase
      switch (await $.doGetTag(fieldKey)) {
        case "select":
          await $.doSelect(fieldKey, "8");
          break;

        case "input":
        case "textarea":
          await $.doType(fieldKey, "uindow", { replace: true });
          break;

        default:
          $.log("Not an editable field", "warning");
          break;
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetValue( element )

> Document: Get the value of an HTML element. Supported elements:<br/>
> - <i>input</i> (includes <i>checkbox</i> and <i>radio</i>)<br/>
> - <i>textarea</i><br/>
> - <i>select</i><br/>
> 
> Returns multiple values for checboxes and <i>&lt;select multiple/&gt;</i>.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {string|string[]|boolean|null} Value or <i>null</i> on error<br/>

* * *

The shape of the result follows the control: a string for text inputs, textareas, radio groups and ordinary dropdowns, an array for checkbox groups and `<select multiple>`. Worth knowing before calling `.join` on something that turned out to be a string.  
This reads the live value, which is what separates it from the `value` attribute: after typing or selecting, the attribute still reports whatever the markup shipped with. Reaching for `$.doGetAttribute(key, "value")` here is a common way to get a stale answer.  
Checking the value after writing it is cheap and catches a whole class of silent failures - input masks that reformat, fields with a maximum length, validators that clear what they don't like.

**example-doGetValue.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Text inputs and textareas give back a string
      const inputKey = await $.doQuery("[name=input-text]");
      await $.doType(inputKey, "foobar", { replace: true });
      $.log(`Input holds: ${await $.doGetValue(inputKey)}`);

      // A radio group gives back the single selected value
      const radioKey = await $.doQuery("input[type=radio][name=r1]");
      await $.doCheck(radioKey, "2");
      $.log(`Radio: ${await $.doGetValue(radioKey)}`);

      // Checkbox groups and <select multiple/> give back an array
      const checkboxKey = await $.doQuery("input[type=checkbox][name=c1]");
      await $.doCheck(checkboxKey, ["2", "4"]);
      const checked = await $.doGetValue(checkboxKey);
      $.log(`Checked: ${checked.join(", ")}`);

      return { next: "verify" };
  - key: verify
    code: |
      // Reading the value back is how you find out whether the field
      // accepted what you typed - masks and validators often rewrite it
      const inputKey = await $.doQuery("[name=input-text]");
      await $.doType(inputKey, "uindow", { replace: true });

      const actual = await $.doGetValue(inputKey);
      if ("uindow" !== actual) {
        throw new Error(`The field holds "${actual}" instead`);
      }

      $.doTick("success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetOptions( element )

> Document: Get all options for a select element.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {{ value:string, selected:true, text: string}[]} List of options<br/>

* * *

`$.doSelect` matches on an option's `value`, which is rarely what a user would recognise: a country dropdown may label an option "Germany" while its value is `DE` or `82`. Reading the options first lets you match the label and pass along the value behind it.  
It's also how you check that a choice exists at all. Options are frequently filtered by earlier answers in the same form, so listing them before selecting turns a silent mis-selection into something you can log and handle.  
Use `$.doGetValue` when you only need what's currently selected; this method is for seeing the full set of possibilities.

**example-doGetOptions.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const selectKey = await $.doQuery("[data-role=select]");

      // Find out what the dropdown actually offers before touching it
      const options = await $.doGetOptions(selectKey);
      $.log(`${options.length} options available`);

      // What is selected right now?
      const current = options.find((o) => o.selected);
      $.log(`Currently selected: ${current ? current.text : "nothing"}`);

      return { next: "choose-by-label" };
  - key: choose-by-label
    code: |
      const selectKey = await $.doQuery("[data-role=select]");
      const options = await $.doGetOptions(selectKey);

      // Users think in labels, but $.doSelect works on values.
      // Match the visible text, then pass along the value behind it.
      const wanted = $.ioInputString("choice").toLowerCase();
      const match = options.find((o) => o.text.toLowerCase().includes(wanted));

      if (!match) {
        $.log(`No option matching "${wanted}"`, "warning");
        $.log(options.map((o) => o.text));

        return;
      }

      await $.doSelect(selectKey, match.value);
      $.log(`Chose "${match.text}"`, "success");

      return { next: "choose-many" };
  - key: choose-many
    code: |
      // Multi-selects work the same way, with an array of values
      const multiKey = await $.doQuery("[data-role=select-multi]");
      const multiOptions = await $.doGetOptions(multiKey);

      await $.doSelect(
        multiKey,
        multiOptions.slice(0, 2).map((o) => o.value)
      );
srcFunctions: []
srcInputs:
  - key: choice
    type: string
    name: Option to pick
    desc: Matched against the visible label of the dropdown
    max: 64
    default: "8"
srcOutputs: []
```

* * *

#### async $.doGetAttribute( element, attr )

> Document: Get a single HTML element attribute.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string} <b>attr</b> HTML attribute (lowercase)<br/>
> <i>@return</i> {string|null} Attribute value or <i>null</i> on error<br/>

* * *

Attributes carry the state a page doesn't show as text: where a link goes, whether a control is disabled, the identifiers a site hangs off `data-` attributes. Names must be lowercase.  
Be careful with `value`. On an input it's the value the markup shipped with, not what the field holds now - after typing or selecting, `$.doGetValue` is what tells you the truth.  
A `null` result is ambiguous: the attribute is missing, or the element is. When the difference matters, confirm the element separately with `$.doQuery` first. Reading several attributes off the same element is one call to `$.doGetAttributes` rather than several here.

**example-doGetAttribute.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const linkKey = await $.doQuery("a[href]");
      if (null === linkKey) {
        return;
      }

      // Attribute names are lowercase
      const href = await $.doGetAttribute(linkKey, "href");
      $.log(`Link points at ${href}`);

      // Data attributes are read the same way
      $.log(await $.doGetAttribute(linkKey, "data-role"));

      return { next: "read-state" };
  - key: read-state
    code: |
      // Boolean attributes are present-or-absent, so an empty string still
      // means "present" - compare against null rather than testing truthiness
      const buttonKey = await $.doQuery("button");
      const disabled = await $.doGetAttribute(buttonKey, "disabled");

      if (null !== disabled) {
        $.log("The button is disabled, skipping", "warning");

        return;
      }

      await $.doClick(buttonKey);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetAttributes( element, attrs = \[\] )

> Document: Get all or multiple HTML element attributes.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string[]} <b>attrs</b> (optional) HTML attributes (lowercase) or empty array for all; default <i>[]</i><br/>
> <i>@return</i> {Object&lt;string,string&gt;} Map of attribute and value<br/>

* * *

Each call crosses into the page, so pulling five attributes off one element costs five round trips with `$.doGetAttribute` and one here. Over a long list that difference is the whole runtime.  
Calling it with no list returns everything, which is mostly a tool for exploration: log it once while writing the module to see what a site actually exposes, then narrow to the handful you need.  
Attributes that aren't set don't appear in the result at all, so reach for `??` rather than expecting an empty string - particularly when the values are heading straight into an output table.

**example-doGetAttributes.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const linkKey = await $.doQuery("a[href]");
      if (null === linkKey) {
        return;
      }

      // Ask for the ones you need, in a single round trip
      const attrs = await $.doGetAttributes(linkKey, ["href", "target", "rel"]);
      $.log(`href=${attrs.href} target=${attrs.target ?? "(none)"}`);

      // Omit the list to see everything the element carries -
      // handy while working out which attributes are worth reading
      $.log(await $.doGetAttributes(linkKey));

      return { next: "scrape" };
  - key: scrape
    code: |
      // Attributes that aren't set are simply missing from the map,
      // so fall back rather than assuming every key is there
      for (const cardKey of await $.doQueryAll("[data-role=card]")) {
        const attrs = await $.doGetAttributes(cardKey, ["data-id", "data-price"]);

        await $.ioOutputRow("cards", {
          id: attrs["data-id"] ?? "",
          price: attrs["data-price"] ?? ""
        });
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: cards
    type: table
    name: Cards
    desc: ""
    columns:
      - id
      - price
```

* * *

#### async $.doGetContent( element, asHtml = false )

> Document: Get the content of an HTML element.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {boolean} <b>asHtml</b> (optional) Use innerHTML instead of innerText; default <i>false</i><br/>
> <i>@return</i> {string|null} Element contents or <i>null</i> on error<br/>

* * *

The default reads the element as rendered text, which is usually what you want when scraping: whitespace is collapsed the way the browser shows it and markup doesn't get in the way.  
Pass `true` for the underlying HTML when the structure carries meaning you'd otherwise lose - links inside a paragraph, a table you intend to parse, or a block you're archiving to disk.  
It's also the simplest way to check that an action worked: click something, then read the element the page updates in response. A `null` result means the element wasn't found rather than that it was empty; an element with no content returns an empty string.

**example-doGetContent.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // The text a person would read
      const title = await $.doGetContent(await $.doQuery("h1"));
      $.log(`Page heading: ${title}`);

      // Confirm the page reacted to an action
      await $.doClick(await $.doQuery("button", { contains: "alpha" }));
      $.log(await $.doGetContent(await $.doQuery(".clicked-button")), "success");

      return { next: "markup" };
  - key: markup
    code: |
      // Pass true when you need the markup rather than the text,
      // for instance to keep the links inside a block of copy
      const bodyKey = await $.doQuery("[data-role=article]");
      if (null === bodyKey) {
        return;
      }

      const html = await $.doGetContent(bodyKey, true);
      await $.ioSaveText("articles", html, { extension: "html" });

      const text = await $.doGetContent(bodyKey);
      $.log(`Saved ${html.length} characters of markup, ${text.length} of text`);
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: articles
    type: files
    name: Articles
    desc: ""
    max: 512
    extensions:
      - html
      - txt
```

* * *

#### async $.doGetStyle( element, props = \[\] )

> Document: Get the resolved values of this element's CSS properties.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string[]} <b>props</b> List of CSS properties to return; default <i>[]</i> to return all<br/>
> <i>@return</i> {object|null} Element CSS properties or <i>null</i> on error; invalid CSS properties are discarded from the result object<br/>

* * *

The values are resolved rather than whatever a stylesheet declared, so this reads the state a page presents through CSS - a row greyed out by a class, an element faded to nothing, a control the design marks as inactive without setting `disabled`.  
For the plain question of whether an element is shown, `$.doGetVisible` is the simpler answer; this is for when you need the actual value, or a property that has nothing to do with visibility.  
Properties that aren't recognised are dropped from the result rather than reported, so a missing key means either an unknown property name or an element that wasn't found. Requesting a short explicit list keeps the result readable and makes a typo obvious.

**example-doGetStyle.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const buttonKey = await $.doQuery(".MuiButton-root", { contains: "foo" });
      if (null === buttonKey) {
        return;
      }

      // Ask for the handful of properties you care about
      const style = await $.doGetStyle(buttonKey, ["display", "visibility", "opacity", "color"]);
      if (null === style) {
        throw new Error("$.doGetStyle failed");
      }

      $.log(style);

      // Values are resolved, so state driven by a class is readable
      if ("none" === style.display || "0" === style.opacity) {
        $.log("The button is hidden by CSS", "warning");

        return;
      }

      await $.doClick(buttonKey);

      return { next: "explore" };
  - key: explore
    code: |
      // Omit the list to get everything - a lot of output, but useful
      // once while working out which properties carry the state you need
      const all = await $.doGetStyle("h1");
      if (null === all) {
        return;
      }

      $.log(`${Object.keys(all).length} properties resolved`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetVisible( element )

> Document: Get whether HTML element is visible on page.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {boolean}<br/>

* * *

A one-shot check of whether the element is shown, covering `display`, `visibility` and `opacity`. Use `$.doAwaitVisible` when you want to wait for that to become true rather than test it now.  
The filtering case above is the one that bites hardest. Search and filter interfaces frequently hide non-matching rows instead of removing them, so `$.doQueryAll` happily returns entries no user can see, and they end up in your output looking perfectly legitimate.  
Hidden is a different question from off screen. An element far below the fold is still visible by this measure - `$.doGetInViewport` is what answers the scroll-position question.

**example-doGetVisible.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const elKey = await $.doQuery("#alert-visible");
      if (null === elKey) {
        return;
      }

      // In the DOM is not the same as on display
      if (!(await $.doGetVisible(elKey))) {
        $.log("Present but hidden - revealing it");

        await $.doClick(await $.doQuery('[data-role="toggle-visible"]'));
        await $.doAwaitVisible(elKey, { timeout: 5 });
      }

      await $.doHighlight(elKey);

      return { next: "skip-hidden" };
  - key: skip-hidden
    code: |
      // Lists often keep filtered-out entries in the DOM rather than
      // removing them, which quietly pollutes a scrape
      let scraped = 0;
      for (const rowKey of await $.doQueryAll("[data-role=row]")) {
        if (!(await $.doGetVisible(rowKey))) {
          continue;
        }

        $.log(await $.doGetContent(rowKey));
        scraped++;
      }

      $.log(`Scraped ${scraped} visible rows`, "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetScrollable( element )

> Document: Get whether HTML element has scroll bars.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {{ horizontal: boolean, vertical: boolean}}<br/>

* * *

Nested scroll areas are a common reason automation quietly does nothing: the script scrolls, the page moves, and the list you actually wanted stays exactly where it was. Checking first tells you whether you're dealing with one.  
`$.doScroll` sends wheel events at the pointer's current position, so the fix is to `$.doHover` the panel before scrolling. The horizontal flag pairs with `{ vertical: false }` for carousels and wide tables.  
To find these elements in the first place, `$.doQuery` and `$.doQueryAll` both take a `scrollable` option that filters to elements with active scrollbars. This method then tells you which axis you're working on.

**example-doGetScrollable.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Find a panel that scrolls on its own
      const panelKey = await $.doQuery("div", { scrollable: true });
      if (null === panelKey) {
        $.log("Nothing on this page scrolls internally");

        return;
      }

      const { horizontal, vertical } = await $.doGetScrollable(panelKey);
      $.log(`Scrollbars - vertical: ${vertical}, horizontal: ${horizontal}`);

      return { next: "scroll-inside" };
  - key: scroll-inside
    code: |
      const panelKey = await $.doQuery("div", { scrollable: true });
      if (null === panelKey) {
        return;
      }

      const scrollable = await $.doGetScrollable(panelKey);

      // Wheel events go wherever the pointer is, so hover the panel
      // first - otherwise the page scrolls and the panel doesn't move
      if (scrollable.vertical) {
        await $.doHover(panelKey);
        await $.doScroll(300, { speed: 400 });
      }

      if (scrollable.horizontal) {
        await $.doHover(panelKey);
        await $.doScroll(300, { vertical: false });
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetInViewport( element )

> Document: Get whether HTML element is even partially located in the viewport.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@return</i> {boolean}<br/>

* * *

This answers a question about scroll position, not about CSS: any overlap with the viewport counts, so an element one pixel inside the bottom edge reports `true`.  
Keep it apart from `$.doGetVisible`, which asks whether an element is hidden by `display`, `visibility` or `opacity`. An element can easily be visible but off screen, or on screen but hidden - the two checks answer different questions and you sometimes want both.  
The scroll-until-visible loop above is the reliable way to drive infinite scrolling, since the page only fetches the next batch once the previous one has been seen. Always bound the loop, or a list that never ends will keep the agent busy forever.

**example-doGetInViewport.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Nothing has scrolled yet, so the title is on screen
      $.log(`Title on screen: ${await $.doGetInViewport("h1")}`);

      await $.doScrollTo(await $.doQuery("h2", { contains: "buttons" }));

      if (!(await $.doGetInViewport("h1"))) {
        $.log("Scrolled past the title", "success");
      }

      return { next: "scroll-until-visible" };
  - key: scroll-until-visible
    code: |
      // Pages that load as you scroll won't respond to jumping straight
      // to the bottom, so walk down until the target comes into view
      const targetKey = await $.doQuery("footer");
      if (null === targetKey) {
        return;
      }

      let attempts = 0;
      while (!(await $.doGetInViewport(targetKey)) && attempts++ < 20) {
        await $.doScroll(500);
        await $.sleep(250);
      }

      if (attempts >= 20) {
        $.log("Never reached the footer", "warning");

        return;
      }

      $.log(`Reached the footer after ${attempts} scrolls`, "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doGetViewport()

> Document: Get the viewport box.<br/>
> 
> <i>@typedef</i> {Object} Box<br/>
> <i>@property</i> {int} <b>left</b> Left coordinate (px)<br/>
> <i>@property</i> {int} <b>top</b> Top coordinate (px)<br/>
> <i>@property</i> {int} <b>width</b> Width of viewport (px)<br/>
> <i>@property</i> {int} <b>height</b> Height of viewport (px)<br/>
> <i>@property</i> {int} <b>scrollLeft</b> Distance of scrolled content from the left (px)<br/>
> <i>@property</i> {int} <b>scrollTop</b> Distance of scrolled content from the top (px)<br/>
> <i>@property</i> {int} <b>scrollWidth</b> Total width of content, including overflow (px)<br/>
> <i>@property</i> {int} <b>scrollHeight</b> Total height of content, including overflow (px)<br/>
> 
> <i>@return</i> {Box}<br/>

* * *

Every coordinate method - `$.doClickAt`, `$.doHoverAt`, `$.doTypeAt`, `$.doQueryAt` - works in viewport space, and this is where you find its bounds. Deriving positions from `width` and `height` keeps a module working across window sizes in a way that hard-coded pixels don't.  
The scroll fields describe the document rather than any element: `scrollHeight` against `height` tells you how much page there is, and `scrollTop` tells you where you are in it. That comparison is also how a full-page screenshot works out its capture height.  
Anything derived from these numbers goes stale as soon as the page scrolls or lazily loads more content, so read the viewport again rather than reusing an earlier copy.

**example-doGetViewport.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const viewport = await $.doGetViewport();
      $.log(`Viewport is ${viewport.width}x${viewport.height}`);
      $.log(`The document is ${viewport.scrollHeight}px tall`);

      // Coordinate methods work in this space, so the centre is easy
      await $.doHoverAt(viewport.width / 2, viewport.height / 2);

      // How far down the page are we?
      const scrollable = viewport.scrollHeight - viewport.height;
      if (scrollable > 0) {
        $.log(`${Math.round((viewport.scrollTop / scrollable) * 100)}% scrolled`);
      } else {
        $.log("The page fits on one screen");
      }

      return { next: "page-by-page" };
  - key: page-by-page
    code: |
      // Scroll exactly one screen at a time, whatever the window size
      await $.doHoverCenter();

      const viewport = await $.doGetViewport();
      const screens = Math.ceil(viewport.scrollHeight / viewport.height);

      for (let i = 1; i < screens && i < 10; i++) {
        await $.doScroll(viewport.height);
        await $.ioSaveScreenshot("screens", { extension: "png" });
        $.doTick("screenshot");
      }
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: screens
    type: files
    name: Screens
    desc: ""
    max: 512
    extensions:
      - png
```

* * *

#### async $.doClick( element, options = {} )

> Document: Click or double-click on HTML element.<br/>
> Automatically scroll to element before action.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Click options<br/>
> <i>@param</i> {int} <b>options.left</b> (optional) Left coordinate relative to element in pixels; default <i>null</i> to horizontally center on the element<br/>
> <i>@param</i> {int} <b>options.top</b> (optional) Top coordinate relative to element in pixels; default <i>null</i> to vertically center on the element<br/>
> <i>@param</i> {boolean} <b>options.double</b> (optional) Double-click; default <i>false</i><br/>
> <i>@param</i> {boolean} <b>options.hover</b> (optional) Hover after click; default <i>true</i>; use <i>false</i> to move mouse to the side after clicking<br/>
> 
> <i>@throws</i> {Error} If element not found<br/>

* * *

The element is scrolled into view before the click, so you don't need to call `$.doScrollTo` first. A missing element throws rather than failing quietly, which is why it's worth checking the result of `$.doQuery` when the element may legitimately be absent.  
`left` and `top` are measured from the element's own top-left corner, not the viewport - use `$.doClickAt` when you want absolute viewport coordinates instead. Both are ignored unless they're integers, in which case the click lands on the center of the element.  
The mouse stays where it clicked by default. Pass `{ hover: false }` when that would leave a dropdown or tooltip open over whatever you need to reach next.

**example-doClick.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Find a button by the text it displays, then click it
      const fooButton = await $.doQuery(".MuiButton-root", { contains: "foo" });
      if (null === fooButton) {
        throw new Error("Could not find the 'foo' button");
      }
      await $.doClick(fooButton);

      // Confirm the page actually reacted
      const clicked = await $.doGetContent(await $.doQuery(".clicked-button"));
      $.log(`Last clicked: ${clicked}`, "success");

      // A CSS selector works anywhere an element key does
      await $.doClick("button", { double: true });

      // Click 10 pixels in from the element's top-left corner instead of its center,
      // and park the mouse aside afterwards so it doesn't sit on top of a tooltip
      await $.doClick(fooButton, { left: 10, top: 10, hover: false });
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doClickAt( left, top, options = {} )

> Document: Click or double-click at coordinates in viewport.<br/>
> 
> <i>@param</i> {int} <b>left</b> Left coordinate in pixels<br/>
> <i>@param</i> {int} <b>top</b> Top coordinate in pixels<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Click options<br/>
> <i>@param</i> {boolean} <b>options.double</b> (optional) Double-click; default <i>false</i><br/>
> <i>@param</i> {boolean} <b>options.hover</b> (optional) Hover after click; default <i>true</i>; use <i>false</i> to move mouse to the side after clicking<br/>
> 
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

Use `$.doClick` whenever an element can be queried - it scrolls the target into view and can't miss because the page shifted. This is for the cases where position _is_ the input: a point along a slider, a spot on a chart, a region of a canvas.  
Nothing is scrolled for you, so the point has to already be on screen. Getting there usually means `$.doScrollTo` first and `$.doGetBox` afterwards, since a box read before scrolling describes where the element used to be.  
Negative or non-integer coordinates return `false` instead of throwing. Pairing the call with `$.doQueryAt` is a cheap way to confirm the point lands on what you expect rather than on an overlay.

**example-doClickAt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Absolute viewport coordinates
      await $.doClickAt(250, 20);

      // Double-click, then move the pointer aside
      await $.doClickAt(50, 20, { double: true, hover: false });

      // Check what you are about to hit before hitting it
      const targetKey = await $.doQueryAt(400, 400);
      if (null === targetKey) {
        $.log("Nothing at that point - skipping the click", "warning");

        return;
      }

      $.log(`About to click a <${await $.doGetTag(targetKey)}>`);
      await $.doClickAt(400, 400);

      return { next: "slider" };
  - key: slider
    code: |
      // Controls with no clickable child - a slider track, a chart,
      // a colour picker - are driven by position
      const box = await $.doGetBox("[data-role=slider]");
      if (null === box) {
        $.log("No slider on this page", "warning");

        return;
      }

      // Three quarters of the way along
      const clicked = await $.doClickAt(
        box.left + Math.round(box.width * 0.75),
        box.top + Math.round(box.height / 2)
      );

      if (!clicked) {
        $.log("The click was refused", "warning");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doHover( element, options = {} )

> Document: Move mouse over an HTML element.<br/>
> Automatically scroll to element before action.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Click options<br/>
> <i>@param</i> {int} <b>options.left</b> (optional) Left coordinate relative to element in pixels; default <i>null</i> to horizontally center on the element<br/>
> <i>@param</i> {int} <b>options.top</b> (optional) Top coordinate relative to element in pixels; default <i>null</i> to vertically center on the element<br/>
> 
> <i>@throws</i> {Error} If element not found<br/>

* * *

Hovering is a real mouse move, so CSS `:hover` rules and `mouseenter` handlers fire exactly as they would for a person. That makes it the way in to menus, tooltips and toolbars that don't exist in the DOM until the pointer arrives.  
The element is scrolled into view first, and a missing element throws. `left` and `top` are measured from the element's own top-left corner; when you'd rather work in viewport coordinates, use `$.doHoverAt`.  
Since `$.doScroll` sends wheel events wherever the pointer currently is, hovering an element first is also how you scroll inside a panel rather than the page.

**example-doHover.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Menus that only exist while the pointer is over the trigger
      await $.doHover(await $.doQuery("h1"));

      if (await $.doAwaitVisible(".dropdown-menu", { timeout: 5 })) {
        await $.doClick(".dropdown-menu a");
      } else {
        $.log("No menu appeared", "warning");
      }

      return { next: "offsets" };
  - key: offsets
    code: |
      // Hover near a corner instead of the middle - useful for wide elements
      // where the center lands on a gap or on a child that swallows the event
      const selectKey = await $.doQuery("[data-role=select]");
      await $.doHover(selectKey, { left: 5, top: 5 });

      // Where did the pointer end up?
      const { left, top } = await $.doGetMouse();
      $.log(`Pointer at ${left} x ${top}`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doHoverAt( left, top )

> Document: Move mouse to coordinates in viewport.<br/>
> 
> <i>@param</i> {int} <b>left</b> Left coordinate in pixels<br/>
> <i>@param</i> {int} <b>top</b> Top coordinate in pixels<br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

The coordinate counterpart to `$.doHover`. Use the element version when you have something to query - it scrolls the target into view first - and this one when the position is what matters, or when the thing under the pointer has no selector worth writing.  
Its most common job isn't hovering at all: it decides where `$.doScroll` sends its wheel events, and where `$.doQueryAt` and `$.doGetMouse` read from. Placing the pointer is often the setup step for something else.  
Coordinates must be non-negative integers within the viewport; anything else returns `false` rather than throwing. Nothing is scrolled on your behalf, so a point below the fold refers to whatever happens to be there now, not to the content you were thinking of.

**example-doHoverAt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const viewport = await $.doGetViewport();

      // Move to the centre of the viewport
      await $.doHoverAt(viewport.width / 2, viewport.height / 2);

      // Coordinates outside the viewport are refused rather than clamped
      if (!(await $.doHoverAt(-10, 50))) {
        $.log("Negative coordinates are rejected", "warning");
      }

      return { next: "scroll-a-panel" };
  - key: scroll-a-panel
    code: |
      // Wheel events go wherever the pointer is, so putting it over a
      // panel is how you scroll the panel instead of the page
      const box = await $.doGetBox("[data-role=long-list]");
      if (null === box) {
        $.log("No inner list on this page", "warning");

        return;
      }

      await $.doHoverAt(box.left + box.width / 2, box.top + box.height / 2);
      await $.doScroll(300);

      // The pointer stays put, so it can be picked up again later
      const { left, top } = await $.doGetMouse();
      $.log(`Pointer resting at ${left} x ${top}`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doHoverCenter()

> Document: Move mouse just slightly outside of viewport center.<br/>
> 
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

A one-line way to get the pointer somewhere harmless without first asking how big the viewport is. It lands slightly off dead centre, which keeps it clear of whatever a page has decided to put exactly in the middle.  
The usual reason to call it is scrolling. `$.doScroll` sends wheel events at the pointer, so leaving the mouse over a dropdown or an inner panel scrolls that instead of the page - moving to a neutral spot first avoids the whole class of problem.  
It's also worth a call before a screenshot or a recording, so a stray hover state doesn't end up in the capture. For anywhere more specific, use `$.doHoverAt` with coordinates from `$.doGetViewport`.

**example-doHoverCenter.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Put the pointer somewhere neutral before scrolling, so the wheel
      // events reach the page rather than a panel or an open menu
      await $.doHoverCenter();
      await $.doScroll(600);

      return { next: "clean-capture" };
  - key: clean-capture
    code: |
      // Leaving the pointer on a control means its hover state ends up
      // in the screenshot - step away first
      const buttonKey = await $.doQuery(".MuiButton-root", { contains: "foo" });
      if (null !== buttonKey) {
        await $.doClick(buttonKey, { hover: false });
      }

      await $.doHoverCenter();
      await $.ioSaveScreenshot("images", { full: true, extension: "png" });
srcFunctions: []
srcInputs: []
srcOutputs:
  - key: images
    type: files
    name: Screenshots
    desc: ""
    max: 256
    extensions:
      - png
```

* * *

#### async $.doJiggle( radius = 50 )

> Document: Jiggle the mouse at the current coordinates.<br/>
> 
> <i>@param</i> {int} <b>radius</b> (optional) Jiggle radius in pixels; [10,500]; default <i>50</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

Small mouse movements around the current position, sent as real pointer events. Place the pointer where you want the movement to happen first - `$.doHoverAt`, `$.doHover` or `$.doHoverCenter` - since jiggling starts from wherever it currently is.  
Pages that hold content back until they've seen the mouse move are the reason this exists. It's also a gentler way to fill a long wait than sleeping, since a session that sees no activity at all sometimes behaves differently from one that does.  
The radius is clamped to between 10 and 500 pixels, so out-of-range values are capped rather than rejected. Keep it small when the pointer is over something clickable - a wide jiggle can wander onto a neighbouring control and trigger its hover state.

**example-doJiggle.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Jiggling happens around wherever the pointer already is,
      // so place it somewhere meaningful first
      const viewport = await $.doGetViewport();
      await $.doHoverAt(viewport.width / 2, viewport.height / 2);

      await $.doJiggle();

      // A wider sweep
      await $.doJiggle(200);

      // The radius is clamped, so an absurd value is simply capped
      await $.doJiggle(5000);

      return { next: "wait-it-out" };
  - key: wait-it-out
    code: |
      // Keep a little movement going while waiting for slow work,
      // rather than sitting perfectly still for minutes on end
      await $.doHoverCenter();

      for (let i = 0; i < 10; i++) {
        if (await $.doAwaitPresent(".report-ready", { timeout: 30 })) {
          $.log("The report is ready", "success");

          return;
        }

        await $.doJiggle(30);
      }

      $.log("Gave up waiting for the report", "warning");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doScroll( amount, options = {} )

> Document: Issue mouse wheel (scroll) events at the current cursor position.<br/>
> 
> <i>@param</i> {int} <b>amount</b> Scroll amount in pixels<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Scroll options<br/>
> <i>@param</i> {int} <b>options.speed</b> (optional) Scroll speed in pixels/second; default <i>500</i>; between <i>1</i> and <i>5000</i><br/>
> <i>@param</i> {boolean} <b>options.vertical</b> (optional) Vertical or Horizontal scroll; default <i>true</i> for vertical<br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

These are real wheel events issued wherever the pointer currently sits, which is the detail that catches people out: with the mouse over a scrollable panel the panel moves and the page doesn't. Position the pointer first with `$.doHover`, `$.doHoverAt` or `$.doHoverCenter`depending on what you mean to scroll.  
Because the page really receives the events, lazy loading and scroll-triggered animations behave as they would for a person - which is exactly why the loop above works, and why jumping straight to the bottom wouldn't.  
`speed` is in pixels per second and controls how long the call takes rather than how far it goes. Leave it high for throughput and drop it for a recording. Watching `scrollHeight` stop changing is the reliable way to know an endless list has ended - always bound the loop as well.

**example-doScroll.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Positive scrolls down, negative scrolls back up
      await $.doScroll(500);
      await $.doScroll(-500);

      // Slow it right down - worth it when recording with $.ioSaveVideo
      await $.doScroll(750, { speed: 150 });

      // Horizontal, for carousels and wide tables
      const carouselKey = await $.doQuery("[data-role=carousel]");
      if (null !== carouselKey) {
        await $.doHover(carouselKey);
        await $.doScroll(400, { vertical: false });
      }

      return { next: "infinite-list" };
  - key: infinite-list
    code: |
      // Park the pointer over the page itself so the wheel events
      // don't get swallowed by a panel or an open menu
      await $.doHoverCenter();

      let lastHeight = 0;
      for (let i = 0; i < 20; i++) {
        const viewport = await $.doGetViewport();

        // The page stopped growing, so there is nothing left to load
        if (viewport.scrollHeight === lastHeight) {
          $.log(`Reached the end after ${i} screens`, "success");

          return;
        }

        lastHeight = viewport.scrollHeight;

        await $.doScroll(viewport.height);
        await $.sleep(500);
      }

      $.log("Gave up after 20 screens", "warning");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doScrollTo( element, options = {} )

> Document: Scroll to HTML element.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Scroll to options<br/>
> <i>@param</i> {int} <b>options.top</b> (optional) Top margin in pixels; default <i>0</i>; target element distance to the top of the viewport in pixels<br/>
> <i>@param</i> {boolean} <b>options.hover</b> (optional) Hover mouse over center of element after scrolling; default <i>true</i><br/>
> 
> <i>@throws</i> {Error} If element not found<br/>

* * *

Most actions - `$.doClick`, `$.doType`, `$.doCheck`, `$.doSelect` - already scroll to the element themselves, so you rarely need this beforehand. Reach for it when the default landing position is wrong, or when you need content to enter the viewport so the page will load it.  
`top` is the gap left between the element and the top of the viewport. A fixed header that overlaps your target is the usual reason to set it: give it a little more than the header's height and the element lands below it rather than underneath.  
The mouse follows to the center of the element unless you pass `{ hover: false }`, which matters when hovering would open something over whatever you need next.

**example-doScrollTo.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Bring something into view before working with it
      const fileInput = await $.doQuery("input[type=file]");
      await $.doScrollTo(fileInput);

      // Leave headroom so a sticky header doesn't end up covering the target
      const buttonsHeading = await $.doQuery("h2", { contains: "buttons" });
      await $.doScrollTo(buttonsHeading, { top: 120 });

      // Scroll without parking the mouse on the element
      await $.doScrollTo("footer", { hover: false });
      $.log(`Footer in viewport: ${await $.doGetInViewport("footer")}`);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doType( element, text, options = {} )

> Document: Type text to specified HTML element.<br/>
> Automatically scroll to element before action.<br/>
> Skips typing if the element is not editable.<br/>
> 
> To save time on large texts, the first part of the text is pasted,<br/>
> and only the last 250 characters are typed one character at a time.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string} <b>text</b> Text to type<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Typing options<br/>
> <i>@param</i> {boolean} <b>options.replace</b> (optional) Replace current text; default <i>false</i> to append text<br/>
> <i>@param</i> {boolean} <b>options.submit</b> (optional) Press the <i>Enter</i> key when finished typing; default <i>false</i><br/>
> <i>@param</i> {int} <b>options.speed</b> (optional) Typing speed in characters per second; <i>[1,250]</i>; default <i>10</i><br/>
> <i>@param</i> {int} <b>options.sequence</b> (optional) Type last N characters in sequence; use clipboard for the rest; <i>[1,1000]</i>; default <i>250</i><br/>
> 
> <i>@throws</i> {Error} If element not found<br/>

* * *

Typing is simulated at the keyboard level, so fields that only react to real key events - autocompletes, validation-as-you-type, character counters - behave the way they would for a person. That fidelity costs time, which is why long strings are pasted up to the last `sequence` characters.  
`speed` and `sequence` are the two dials worth knowing. Raise `speed` and lower `sequence` when you're filling in bulk data and nobody is watching; leave the defaults when the page is picky about how input arrives, or when you're recording a video of the run.  
Typing appends unless you pass `{ replace: true }`, and non-editable elements are skipped silently rather than throwing - only a missing element is an error.

**example-doType.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const inputKey = await $.doQuery("[name=input-text]");
      await $.doHighlight(inputKey);

      // Successive calls append by default
      await $.doType(inputKey, "abc");
      await $.doType(inputKey, "def");
      $.log(`Field now holds: ${await $.doGetValue(inputKey)}`);

      // Clear the field first
      await $.doType(inputKey, "foobar", { replace: true });

      return { next: "search" };
  - key: search
    code: |
      // Fill a search box and press Enter in one call
      const searchKey = await $.doQuery("[name=input-textfield]");
      await $.doType(searchKey, "uindow automation", { replace: true, speed: 40, submit: true });

      return { next: "long-text" };
  - key: long-text
    code: |
      // Long text is pasted up front, with only the tail typed character by character.
      // Lowering "sequence" pastes more of it and finishes sooner.
      const essay = Array.from({ length: 20 }, (_, i) => `${i + 1}. Lorem ipsum dolor sit amet.`).join("\n");

      await $.doType(await $.doQuery("[name=textarea]"), essay, {
        replace: true,
        speed: 250,
        sequence: 50
      });

      $.doTick("success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doTypeAt( left, top, text, options = {} )

> Document: Type text at coordinates in viewport.<br/>
> 
> To save time on large texts, the first part of the text is pasted,<br/>
> and only the last 250 characters are typed one character at a time.<br/>
> 
> <i>@param</i> {int} <b>left</b> Left coordinate in pixels<br/>
> <i>@param</i> {int} <b>top</b> Top coordinate in pixels<br/>
> <i>@param</i> {string} <b>text</b> Text to type<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Typing options<br/>
> <i>@param</i> {boolean} <b>options.replace</b> (optional) Replace current text; default <i>false</i> to append text<br/>
> <i>@param</i> {boolean} <b>options.submit</b> (optional) Press the <i>Enter</i> key when finished typing; default <i>false</i><br/>
> <i>@param</i> {int} <b>options.speed</b> (optional) Typing speed in characters per second; <i>[1,250]</i>; default <i>10</i><br/>
> <i>@param</i> {int} <b>options.sequence</b> (optional) Type last N characters in sequence; use clipboard for the rest; <i>[1,1000]</i>; default <i>250</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on failure<br/>

* * *

Same typing behaviour as `$.doType` - the `replace`, `submit`, `speed` and `sequence` options all mean the same thing - addressed by position rather than by element.  
Prefer `$.doType` whenever you have something to query: it scrolls the element into view first, and it can't be thrown off by the page moving underneath it. This is for the cases where there is no element to name, which in practice means editors that manage their own caret, canvas-based widgets, and controls buried in shadow DOM.  
Nothing is scrolled for you here, so make sure the point is on screen. Invalid coordinates return `false` rather than throwing, which is worth checking - typing that silently went nowhere is hard to spot later.

**example-doTypeAt.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const inputKey = await $.doQuery("[name=input-text]");
      const box = await $.doGetBox(inputKey);
      if (null === box) {
        throw new Error("$.doGetBox failed");
      }

      // Type into the middle of the field
      const typed = await $.doTypeAt(
        box.left + box.width / 2,
        box.top + box.height / 2,
        "baz",
        { replace: true }
      );

      if (!typed) {
        $.log("Those coordinates were rejected", "warning");

        return;
      }

      $.log(`Field holds: ${await $.doGetValue(inputKey)}`);

      return { next: "editor" };
  - key: editor
    code: |
      // Rich editors and canvas widgets often have no input to query.
      // Click to place the caret, then type at the same point.
      const editorBox = await $.doGetBox("[data-role=editor]");
      if (null === editorBox) {
        $.log("No editor on this page", "warning");

        return;
      }

      const left = editorBox.left + 20;
      const top = editorBox.top + 20;

      await $.doClickAt(left, top);
      await $.doTypeAt(left, top, "Hello from Uindow", { speed: 30 });
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doSelect( element, values )

> Document: Select zero, one or more options, replacing previous selection.<br/>
> Automatically scroll to element before action.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string|string[]} <b>values</b> A single value or an array of values for <i>&lt;select multiple/&gt;</i><br/>
> 
> <i>@throws</i> {Error} If select element not found<br/>

* * *

Every call replaces the current selection rather than adding to it, which is why an empty array clears a multi-select and why a single value is enough for an ordinary dropdown. You never have to deselect anything first.  
Matching happens on each option's `value`, not its visible label - a country list may show "Germany" while its value is `DE`. When you're working from something a user typed or a table column, read the options with `$.doGetOptions` first and map the label across.  
This is for `<select>` elements. Radios and checkboxes are handled by `$.doCheck`, and dropdowns built out of divs and list items need ordinary `$.doClick` calls instead.

**example-doSelect.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // A single value
      const selectKey = await $.doQuery("[data-role=select]");
      await $.doSelect(selectKey, "8");
      $.log(`Selected: ${await $.doGetValue(selectKey)}`);

      // An array for <select multiple/> - this replaces the whole selection,
      // so anything not listed ends up deselected
      const multiKey = await $.doQuery("[data-role=select-multi]");
      await $.doSelect(multiKey, ["3", "15"]);
      $.log(await $.doGetValue(multiKey));

      // An empty array selects nothing at all
      await $.doSelect(multiKey, []);

      return { next: "by-label" };
  - key: by-label
    code: |
      // Values are rarely what the user sees. Read the options,
      // match the label, then select the value behind it.
      const selectKey = await $.doQuery("[data-role=select]");
      const options = await $.doGetOptions(selectKey);

      const match = options.find((o) => o.text.toLowerCase().includes("8"));
      if (!match) {
        $.log("No matching option", "warning");

        return;
      }

      await $.doSelect(selectKey, match.value);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doCheck( element, values, options = {} )

> Document: Check radio or checkbox values.<br/>
> 
> The element's siblings must share the same name attribute.<br/>
> Automatically scroll to element(s) before action.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string|string[]} <b>values</b> A single value or an array of values<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Check options<br/>
> <i>@param</i> {boolean} <b>options.hover</b> (optional) Hover after check; default <i>true</i>; use <i>false</i> to move mouse to the side after clicking<br/>
> 
> <i>@throws</i> {Error} If checkbox or radio input element not found<br/>

* * *

`$.doCheck` addresses a group rather than a single input: it resolves the siblings sharing the same `name` attribute, so you only ever have to query one member of the group. Pass a single string for radios and an array for checkboxes.  
Values are matched against each input's `value` attribute. They're stringified internally, so `2` and `"2"` are equivalent. Custom widgets such as MUI switches and checkboxes are driven the same way as plain HTML inputs, since MUI renders a real input underneath. Read the result back with `$.doGetValue`, which returns a string for a radio group and an array for a checkbox group.  
Use `{ hover: false }` when the group sits under a tooltip or a hover menu that would otherwise cover the next element you want to reach.

**example-doCheck.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Radios take a single value - any sibling sharing name="r1" can be targeted
      const radioKey = await $.doQuery("input[type=radio][name=r1]");
      await $.doCheck(radioKey, "2");

      const radioValue = await $.doGetValue(radioKey);
      $.log(`Radio r1 is now ${radioValue}`, "success");

      // Checkboxes take an array of values
      const checkboxKey = await $.doQuery("input[type=checkbox][name=c1]");
      await $.doCheck(checkboxKey, ["2", "4"], { hover: false });

      // $.doGetValue returns an array for a checkbox group
      const checkboxValues = await $.doGetValue(checkboxKey);
      $.log(`Checkbox c1 is now ${checkboxValues.join(", ")}`, "success");

      // MUI switches are backed by a real input, so they behave identically
      const switchKey = await $.doQuery("input[type=checkbox][name=s1]");
      await $.doCheck(switchKey, ["1", "3"]);
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doChooseFiles( element, filePaths )

> Document: Choose files for <i>&lt;input type="file" /&gt;</i> HTML element.<br/>
> Automatically scroll to element before action.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {string|string[]} <b>filePaths</b> File path(s) generated with <i>$.ioSave\*</i> methods or <i>$.ioInputFiles</i><br/>
> 
> <i>@throws</i> {Error} If file input element not found, or could not choose files<br/>

* * *

This attaches files to the input directly, without ever opening the operating system's file picker, so the run isn't blocked waiting on a native dialog.  
Paths have to come from somewhere Uindow already knows about: a files input read with `$.ioInputFiles`, or a file the module wrote itself with one of the `$.ioSave*` methods. A single path can be passed on its own or inside an array.  
Calling it with an empty array is a no-op that returns `false`. A missing file input, or a selection the page rejects, throws instead.

**example-doChooseFiles.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Paths supplied by the user through the files input
      const filePaths = $.ioInputFiles("uploads");
      if (!filePaths.length) {
        $.log("No files supplied, nothing to attach", "warning");

        return;
      }

      const fileInput = await $.doQuery("input[type=file]");
      await $.doChooseFiles(fileInput, filePaths);

      // Read back what the input is holding
      const chosen = await $.doGetValue(fileInput);
      $.log(`Attached ${chosen.length} of ${filePaths.length} file(s)`, "success");

      return { next: "attach-generated" };
  - key: attach-generated
    code: |
      // Files the module produced itself work exactly the same way
      const reportPath = await $.ioSaveText("reports", JSON.stringify({ ok: true }, null, 2), {
        extension: "json"
      });

      if (null === reportPath) {
        throw new Error("Could not write the report");
      }

      // A single path may be passed without wrapping it in an array
      await $.doChooseFiles("input[type=file]", reportPath);
srcFunctions: []
srcInputs:
  - key: uploads
    type: files
    name: Files to attach
    desc: Files picked by the user
    extensions:
      - png
      - jpg
      - jpeg
      - pdf
srcOutputs:
  - key: reports
    type: files
    name: Reports
    desc: ""
    max: 64
    extensions:
      - json
```

* * *

#### async $.doAwaitDomReady( options )

> Document: Wait for page to load (DOM ready).<br/>
> 
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on timeout<br/>

* * *

`$.navLoad` already waits for DOM ready, so this is for the navigations you didn't start yourself: a clicked link, a submitted form, a redirect fired by the page's own scripts.  
DOM ready means the document has been parsed, not that everything is rendered. Single page apps in particular may never fire it again after the first load, since they swap content without a new document. When you're waiting for specific content rather than a whole page, `$.doAwaitPresent` and `$.doAwaitVisible` are the better tools.  
A timeout returns `false` instead of throwing, which makes it safe to use as a condition.

**example-doAwaitDomReady.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/");

      // Clicking a link starts a navigation, but the call returns as soon as the
      // click lands - not when the next document is ready
      const linkKey = await $.doQuery("a", { contains: "test" });
      if (null === linkKey) {
        throw new Error("Could not find the link");
      }
      await $.doClick(linkKey);

      if (!(await $.doAwaitDomReady({ timeout: 30 }))) {
        $.log("The next page never became ready", "warning");

        return;
      }

      $.log(`Now on ${await $.navGetUrl()}`, "success");

      return { next: "submit-form" };
  - key: submit-form
    code: |
      // Submitting a form is the same story
      await $.doType("[name=input-text]", "uindow", { replace: true, submit: true });
      await $.doAwaitDomReady({ timeout: 30 });

      // DOM ready is not the same as "the content I want is on screen".
      // For anything rendered afterwards, wait for the element itself.
      const resultsKey = await $.doAwaitPresent(".results", { timeout: 15 });
      if (!resultsKey) {
        $.log("Results never appeared", "warning");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doAwaitPresent( selector, options = {} )

> Document: Wait for an element to be present in the DOM.<br/>
> 
> <i>@param</i> {string} <b>selector</b> CSS selector<br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {string} <b>options.parent</b> (optional) Parent CSS selector OR element key; default <i>null</i> to search the entire Document<br/>
> <i>@param</i> {string} <b>options.contains</b> (optional) Text contained by element (case insensitive); default <i>null</i> for no restrictions<br/>
> <i>@param</i> {boolean} <b>options.scrollable</b> (optional) Restrict results to elements that have active scrollbars; default <i>false</i><br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Timeout in seconds; default <i>60</i><br/>
> <i>@param</i> {boolean} <b>options.all</b> (optional) Return all matches (<i>string[]</i> instead of <i>string</i>); default <i>false</i><br/>
> <i>@return</i> {string|string[]|false} <i>Element key</i> if <i>options.all</i>; array of 24 characters long <i>element keys</i>; <i>false</i> on timeout<br/>

* * *

This is the tool for content that arrives after the page has loaded - results fetched over the network, rows rendered by a script, a dialog opened by an earlier click. Use it instead of sleeping for a fixed interval, which either wastes time or breaks on a slow day.  
A timeout returns `false` rather than throwing, so `if (!key)` covers it. That's worth noting alongside `$.doQuery`, which reports nothing found as `null`. With `{ all: true }` the result is an array of keys, so check with `Array.isArray` before reading `length`.  
Present means in the DOM, which is not the same as on screen. Plenty of pages render a panel hidden and reveal it later - follow up with `$.doAwaitVisible` when you need it actually shown.

**example-doAwaitPresent.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Trigger something, then wait for what it produces
      const btnToggle = await $.doQuery('[data-role="toggle-present"]');
      $.setTimeout(async () => await $.doClick(btnToggle), 1000);

      const alertKey = await $.doAwaitPresent("#alert-present", { timeout: 10 });
      if (!alertKey) {
        $.log("The alert never appeared", "warning");

        return;
      }

      await $.doHighlight(alertKey);
      $.log(await $.doGetContent(alertKey), "success");

      return { next: "wait-for-many" };
  - key: wait-for-many
    code: |
      // Every match rather than the first, for lists that fill in gradually
      const rowKeys = await $.doAwaitPresent("[data-role=row]", { timeout: 15, all: true });
      if (!Array.isArray(rowKeys)) {
        $.log("No rows arrived in time", "warning");

        return;
      }

      $.log(`${rowKeys.length} rows arrived`, "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doAwaitNotPresent( element, options = {} )

> Document: Wait for an element to be removed from the DOM.<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on timeout<br/>

* * *

The mirror of `$.doAwaitPresent`, and the honest way to confirm a destructive action worked: click delete, then wait for the thing to actually leave the DOM instead of assuming it did.  
Passing an element key rather than a selector makes the check specific. A selector would be satisfied the moment no element matches, which on a list of similar rows tells you far less than watching one particular row disappear.  
Removal is not the same as hiding. Pages that merely add a class or set `display: none` keep the element in the DOM, and this call will sit there until it times out - `$.doAwaitNotVisible` is what those need.

**example-doAwaitNotPresent.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Wait for a spinner to be torn out of the DOM
      if (!(await $.doAwaitNotPresent(".loading-spinner", { timeout: 30 }))) {
        $.log("Still loading after 30 seconds", "warning");

        return;
      }

      $.log("Content is ready", "success");

      return { next: "confirm-removal" };
  - key: confirm-removal
    code: |
      // An element key works here as well as a selector, which is what you want
      // when confirming that one specific row went away rather than any match
      const rowKey = await $.doQuery("[data-role=row]");
      if (null === rowKey) {
        return;
      }

      const deleteKey = await $.doQuery("button", { parent: rowKey, contains: "delete" });
      if (null === deleteKey) {
        return;
      }

      await $.doClick(deleteKey);

      if (await $.doAwaitNotPresent(rowKey, { timeout: 10 })) {
        $.log("Row removed", "success");
      } else {
        $.log("The row is still there - the delete may have failed", "error");
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doAwaitVisible( element, options = {} )

> Document: Wait for an element to become visible to the user (display, visibility, opacity).<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on timeout<br/>

* * *

Visibility here means the element is actually shown - not hidden through `display`, `visibility` or `opacity`. Animated panels and modals are the common case: they're in the DOM well before they finish appearing, and clicking one mid-transition often misses.  
The element has to exist for this to be meaningful, so for content that hasn't rendered yet the pattern is two calls - `$.doAwaitPresent` to get a key, then this to wait for it to be shown.  
Shown is still not the same as scrolled into view. Use `$.doGetInViewport` for that question, or just let the action's own automatic scrolling handle it.

**example-doAwaitVisible.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      const elKey = await $.doQuery("#alert-visible");
      const btnToggle = await $.doQuery('[data-role="toggle-visible"]');

      // Reveal it in a moment, then wait for that to happen
      $.setTimeout(async () => await $.doClick(btnToggle), 1000);

      if (!(await $.doAwaitVisible(elKey, { timeout: 5 }))) {
        $.log("It never became visible", "warning");

        return;
      }

      await $.doHighlight(elKey);

      return { next: "modal" };
  - key: modal
    code: |
      // For something not in the DOM yet, wait for it to exist first,
      // then wait for it to be shown
      const modalKey = await $.doAwaitPresent(".modal", { timeout: 10 });
      if (!modalKey) {
        $.log("The dialog never opened", "warning");

        return;
      }

      if (await $.doAwaitVisible(modalKey, { timeout: 5 })) {
        await $.doClick(await $.doQuery("button", { parent: modalKey, contains: "confirm" }));
      }
srcFunctions: []
srcInputs: []
srcOutputs: []
```

* * *

#### async $.doAwaitNotVisible( element, options = {} )

> Document: Wait for an element to become invisible to the user (display, visibility, opacity).<br/>
> 
> <i>@param</i> {string} <b>element</b> CSS selector OR element key obtained with <i>$.doQuery\*</i><br/>
> <i>@param</i> {Object} <b>options</b> (optional) Query options<br/>
> <i>@param</i> {int} <b>options.timeout</b> (optional) Timeout in seconds; default <i>60</i><br/>
> <i>@return</i> {boolean} <i>true</i> on success, <i>false</i> on timeout<br/>

* * *

Most of the things that get in an agent's way - cookie banners, modal backdrops, loading masks - are hidden rather than removed when dismissed. This waits for that, where `$.doAwaitNotPresent` would sit until it timed out.  
It's worth waiting rather than clicking straight through. An overlay mid-fade still intercepts pointer events, so the click lands on the overlay and the action you intended silently doesn't happen.  
A timeout returns `false` instead of throwing, which makes it usable as a condition and lets you decide whether a stubborn overlay is worth abandoning the run over.

**example-doAwaitNotVisible.js.yaml**
```yaml
srcStateMachine:
  - key: start
    code: |
      await $.navLoad("about:home/test/");

      // Overlays and loading masks usually fade rather than being removed,
      // and clicking through one before it's gone hits the overlay instead
      if (await $.doAwaitNotVisible(".overlay", { timeout: 15 })) {
        $.log("Overlay cleared", "success");
      }

      return { next: "cookie-banner" };
  - key: cookie-banner
    code: |
      const bannerKey = await $.doQuery("#cookie-banner");
      if (null === bannerKey) {
        $.log("No banner in the way");

        return;
      }

      const acceptKey = await $.doQuery("button", { parent: bannerKey, contains: "accept" });
      if (null === acceptKey) {
        return;
      }

      await $.doClick(acceptKey);

      // Only carry on once it has actually gone
      if (!(await $.doAwaitNotVisible(bannerKey, { timeout: 10 }))) {
        $.log("The banner is still covering the page", "error");

        return;
      }

      $.log("Banner dismissed", "success");
srcFunctions: []
srcInputs: []
srcOutputs: []
```

[Create an account]: https://uindow.com/install/
[$.fn("function-key")]: #/doc:fn
[$.ioInput\*()]: #/doc:ioInputInt
[$.ioOutput\*()]: #/doc:ioOutputInt
[$.global\*()]: #/doc:globalEnvGet
[$.previous]: #/doc:previous
[$.current]: #/doc:current
[$.pause()]: #/doc:pause
[$.globalRunSet()]: #/doc:globalRunSet
[$.navLoad()]: #/doc:navLoad
[$.doRequest()]: #/doc:doRequest
[$.ioSaveRequest()]: #/doc:ioSaveRequest
[$.osRequest()]: #/doc:osRequest