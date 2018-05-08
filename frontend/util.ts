export function requireBackend<T>(moduleName: string) {
  return (window as any).require("electron").remote.require(moduleName) as T;
}
