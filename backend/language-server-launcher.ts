import { spawn } from "child_process";
import { ipcMain } from "electron";
import * as path from "path";
import * as process from "process";
import { Message, StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc";

import { mainWindow } from "./main";

export function launchLanguageServer(): { ipcChannel: string } {
  // spawn the language server process of your choice (e.g. TypeScript)
  const lsPath = path.resolve(
    `node_modules/.bin/typescript-language-server${process.platform.startsWith("win") ? ".cmd" : ""}`
  );
  const lsArgs = ["--stdio"];
  console.log(`launching typescript language server process with ${lsPath} ${lsArgs.join("\n")}`);
  const lsProcess = spawn(lsPath, lsArgs);

  // choose a unique channel name, e.g. by using the PID
  const ipcChannel = "ls_" + lsProcess.pid;

  // create reader/writer for I/O streams
  const reader = new StreamMessageReader(lsProcess.stdout);
  const writer = new StreamMessageWriter(lsProcess.stdin);

  // forward everything from process's stdout to the mainWindow's renderer process
  reader.listen((msg) => {
    mainWindow.webContents.send(ipcChannel, msg);
  });

  // listen to incoming messages and forward them to the language server process
  ipcMain.on(ipcChannel, (event: any, msg: Message) => {
    writer.write(msg);
  });

  return { ipcChannel };
}
