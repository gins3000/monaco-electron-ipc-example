# monaco-electron-ipc-example

A minimal example on how to use monaco editor and a language server with Electron
using Electron's IPC API and TypeFox's monaco-languageclient (https://github.com/TypeFox/monaco-languageclient).

- Electron sample based on https://github.com/electron/electron-quick-start-typescript
- Monaco integration based on https://github.com/Microsoft/monaco-editor-samples/tree/master/electron-amd

## Background

In Electron, the language servers would be started in the main process, and the connection somehow
needs to be forwarded to the browser window, where monaco is hosted.

However, if a MessageConnection is created in the main process, and then simply passed to the window via
remote require, severe performance issues will be encountered.

One way to work around this, is to use websockets, as one would when building monaco into a web page,
and hosting the language server remotely. However in a local environment such as an Electron-based desktop app,
one may want to avoid the network stack altogether.

This example shows a minimalistic way to set up a language client in the backend,
communicating via stdio with the language server and via IPC with the frontend.

## Run the example
```
git clone https://github.com/gins3000/monaco-electron-ipc-example.git
cd monaco-electron-ipc-example
npm install
npm start
```
