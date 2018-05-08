// tslint:disable-next-line:no-reference
/// <reference path="../node_modules/monaco-editor-core/monaco.d.ts" />

import * as backendUtilModule from "../backend/util";
import { startLanguageClient } from "./language-client";
import { requireBackend } from "./util";

const backendUtil = requireBackend<typeof backendUtilModule>("./util");

// sample configuration, try it with other paths or files, if you want
const projectRoot = ".";
const filePath = "frontend/index.ts";

// get monaco loader's require, see index.html
const monacoRequire = (global as any).monacoRequire;
monacoRequire.config({
  baseUrl: backendUtil.path.resolve(__dirname + "/../../node_modules/monaco-editor-core/dev")
});

// load monaco
monacoRequire(["vs/editor/editor.main"], async () => {
  const fullProjectPath = backendUtil.path.resolve(projectRoot);
  const fullFilePath = backendUtil.path.join(fullProjectPath, filePath);
  const fileContents = await backendUtil.getFileContents(fullFilePath);

  // register typescript as a language
  // syntax highlighting is not part of this example
  monaco.languages.register({
    aliases: ["TypeScript", "ts", "typescript"],
    extensions: [".ts", ".tsx"],
    id: "typescript",
    mimetypes: ["text/typescript"]
  });

  // create editor instance
  const editor = monaco.editor.create(document.body, {
    automaticLayout: true,
    model: monaco.editor.createModel(fileContents, undefined, pathToUri(fullFilePath)),
    theme: "vs-dark" // dark theme, because why not
  });

  // start the language client
  startLanguageClient(editor, pathToUri(fullProjectPath).toString());
});

function pathToUri(path: string) {
  return monaco.Uri.parse("file:///" + path.replace(/\\/g, "/"));
}