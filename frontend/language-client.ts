import {
  CloseAction,
  createConnection,
  ErrorAction,
  MonacoLanguageClient,
  MonacoServices
} from "monaco-languageclient";
import {
  createMessageConnection,
  DataCallback,
  Disposable,
  Message,
  MessageConnection,
  MessageReader,
  MessageWriter,
  Trace
} from "vscode-jsonrpc";

import * as languageServerLauncherModule from "../backend/language-server-launcher";

import { requireBackend } from "./util";

export function startLanguageClient(editor: monaco.editor.IStandaloneCodeEditor, rootUri: string) {
  // create & install services
  MonacoServices.install(editor, { rootUri });

  // launch language server
  const lsLauncher = requireBackend<typeof languageServerLauncherModule>("./language-server-launcher");
  const { ipcChannel } = lsLauncher.launchLanguageServer();

  // wire up the IPC connection
  const reader = new RendererIpcMessageReader(ipcChannel);
  const writer = new RendererIpcMessageWriter(ipcChannel);
  const connection = createMessageConnection(reader, writer);

  // create and start the language client
  const client = createBaseLanguageClient(connection);
  client.start();

  return client;
}

function createBaseLanguageClient(connection: MessageConnection) {
  const client = new MonacoLanguageClient({
    clientOptions: {
      documentSelector: ["typescript"],
      errorHandler: {
        closed: () => CloseAction.DoNotRestart,
        error: () => ErrorAction.Continue
      }
    },
    connectionProvider: {
      get: async (errorHandler, closeHandler) => createConnection(connection, errorHandler, closeHandler)
    },
    name: "typescript language server"
  });

  // for debugging
  client.trace = Trace.Messages;

  return client;
}

// tslint:disable-next-line:no-var-requires
const ipcRenderer = require("electron").ipcRenderer;

// custom implementations of the MessageReader and MessageWriter to plug into a MessageConnection
class RendererIpcMessageReader implements MessageReader {
  private subscribers: DataCallback[] = [];
  private handler = this.notifySubscribers.bind(this);

  constructor(private channel: string) {
    // listen to incoming language server notifications and messages from the backend
    ipcRenderer.on(this.channel, this.handler);
  }

  // events are not implemented for this example
  public onError = () => dummyDisposable();
  public onClose = () => dummyDisposable();
  public onPartialMessage = () => dummyDisposable();

  public listen(callback: DataCallback): void {
    this.subscribers.push(callback);
  }

  public dispose(): void {
    ipcRenderer.removeListener(this.channel, this.handler);
  }

  private notifySubscribers(event: any, msg: Message) {
    this.subscribers.forEach((s) => s(msg));
  }
}

class RendererIpcMessageWriter implements MessageWriter {
  constructor(private channel: string) { }

  // events are not implemented for this example
  public onError = () => dummyDisposable();
  public onClose = () => dummyDisposable();

  public write(msg: Message): void {
    // send all requests for the language server to the backend
    ipcRenderer.send(this.channel, msg);
  }

  public dispose(): void {
    // nothing to dispose
  }
}

// dummy disposable to satisfy interfaces
function dummyDisposable(): Disposable {
  return {
    dispose: () => void 0
  };
}
