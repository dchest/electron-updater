declare module "electron-updater/out/electronHttpExecutor" {
  import { DownloadOptions, HttpExecutor } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  export const NET_SESSION_NAME = "electron-updater"
  export type LoginCallback = (username: string, password: string) => void

  export class ElectronHttpExecutor extends HttpExecutor<Electron.ClientRequest> {
    private proxyLoginCallback
    constructor(proxyLoginCallback?: ((authInfo: any, callback: LoginCallback) => void) | undefined)
    download(url: string, destination: string, options: DownloadOptions): Promise<string>
    doApiRequest<T>(options: any, cancellationToken: CancellationToken, requestProcessor: (request: Electron.ClientRequest, reject: (error: Error) => void) => void, redirectCount?: number): Promise<T>
    doRequest(options: any, callback: (response: any) => void): any
    private addProxyLoginHandler(request)
  }
}

declare module "electron-updater" {
  /// <reference types="node" />
  import { RequestHeaders } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { ProgressInfo } from "electron-builder-http/out/ProgressCallbackTransform"
  import { UpdateInfo, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { EventEmitter } from "events"
  import { Url } from "url"
  import { AppUpdater } from "electron-updater/out/AppUpdater"
  import { LoginCallback } from "electron-updater/out/electronHttpExecutor"
  export { NET_SESSION_NAME } from "electron-updater/out/electronHttpExecutor"
  export { AppUpdater } from "electron-updater/out/AppUpdater"
  export const autoUpdater: AppUpdater

  export interface FileInfo {
    readonly name: string
    readonly url: string
    readonly sha2?: string
    readonly sha512?: string
    readonly headers?: Object
  }

  export abstract class Provider<T extends VersionInfo> {
    protected requestHeaders: RequestHeaders | null
    setRequestHeaders(value: RequestHeaders | null): void
    abstract getLatestVersion(): Promise<T>
    abstract getUpdateFile(versionInfo: T): Promise<FileInfo>
    static validateUpdateInfo(info: UpdateInfo): void
  }

  export function getDefaultChannelName(): string

  export function getCustomChannelName(channel: string): string

  export function getCurrentPlatform(): any

  export function isUseOldMacProvider(): boolean

  export function getChannelFilename(channel: string): string

  export interface UpdateCheckResult {
    readonly versionInfo: VersionInfo
    readonly fileInfo?: FileInfo
    readonly downloadPromise?: Promise<any> | null
    readonly cancellationToken?: CancellationToken
  }
  export const DOWNLOAD_PROGRESS = "download-progress"
  export const UPDATE_DOWNLOADED = "update-downloaded"
  export type LoginHandler = (authInfo: any, callback: LoginCallback) => void

  export class UpdaterSignal {
    private emitter
    constructor(emitter: EventEmitter)
    /**
     * Emitted when an authenticating proxy is asking for user credentials.
     * @see [Electron docs](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login)
     */
    login(handler: LoginHandler): void
    progress(handler: (info: ProgressInfo) => void): void
    updateDownloaded(handler: (info: VersionInfo) => void): void
    updateCancelled(handler: (info: VersionInfo) => void): void
  }

  export function formatUrl(url: Url): string

  export interface Logger {
    info(message?: any): void
    warn(message?: any): void
    error(message?: any): void
  }
}

declare module "electron-updater/out/BintrayProvider" {
  import { HttpExecutor } from "electron-builder-http"
  import { BintrayOptions, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { FileInfo, Provider } from "electron-updater"

  export class BintrayProvider extends Provider<VersionInfo> {
    private client
    setRequestHeaders(value: any): void
    constructor(configuration: BintrayOptions, httpExecutor: HttpExecutor<any>)
    getLatestVersion(): Promise<VersionInfo>
    getUpdateFile(versionInfo: VersionInfo): Promise<FileInfo>
  }
}

declare module "electron-updater/out/GenericProvider" {
  import { HttpExecutor } from "electron-builder-http"
  import { GenericServerOptions, UpdateInfo } from "electron-builder-http/out/publishOptions"
  import { FileInfo, Provider } from "electron-updater"

  export class GenericProvider extends Provider<UpdateInfo> {
    private readonly configuration
    private readonly executor
    private readonly baseUrl
    private readonly channel
    constructor(configuration: GenericServerOptions, executor: HttpExecutor<any>)
    getLatestVersion(): Promise<UpdateInfo>
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>
  }
}

declare module "electron-updater/out/GitHubProvider" {
  /// <reference types="node" />
  import { HttpExecutor } from "electron-builder-http"
  import { GithubOptions, UpdateInfo } from "electron-builder-http/out/publishOptions"
  import { RequestOptions } from "http"
  import { AppUpdater } from "electron-updater/out/AppUpdater"
  import { FileInfo, Provider } from "electron-updater"

  export abstract class BaseGitHubProvider<T extends UpdateInfo> extends Provider<T> {
    protected readonly options: GithubOptions
    protected readonly baseUrl: RequestOptions
    constructor(options: GithubOptions, baseHost: string)
  }

  export class GitHubProvider extends BaseGitHubProvider<UpdateInfo> {
    protected readonly options: GithubOptions
    private readonly updater
    private readonly executor
    constructor(options: GithubOptions, updater: AppUpdater, executor: HttpExecutor<any>)
    getLatestVersion(): Promise<UpdateInfo>
    private getLatestVersionString(basePath, cancellationToken)
    private readonly basePath
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>
    private getBaseDownloadPath(version, fileName)
  }
}

declare module "electron-updater/out/PrivateGitHubProvider" {
  import { HttpExecutor } from "electron-builder-http"
  import { GithubOptions, UpdateInfo } from "electron-builder-http/out/publishOptions"
  import { BaseGitHubProvider } from "electron-updater/out/GitHubProvider"
  import { FileInfo } from "electron-updater"

  export interface PrivateGitHubUpdateInfo extends UpdateInfo {
    assets: Array<Asset>
  }

  export class PrivateGitHubProvider extends BaseGitHubProvider<PrivateGitHubUpdateInfo> {
    private readonly token
    private readonly executor
    private readonly netSession
    constructor(options: GithubOptions, token: string, executor: HttpExecutor<any>)
    getLatestVersion(): Promise<PrivateGitHubUpdateInfo>
    private registerHeaderRemovalListener()
    private configureHeaders(accept)
    private getLatestVersionInfo(basePath, cancellationToken)
    private readonly basePath
    getUpdateFile(versionInfo: PrivateGitHubUpdateInfo): Promise<FileInfo>
  }

  export interface Asset {
    name: string
    url: string
  }
}

declare module "electron-updater/out/AppUpdater" {
  /// <reference types="node" />
  import { RequestHeaders } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { BintrayOptions, GenericServerOptions, GithubOptions, PublishConfiguration, S3Options, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { EventEmitter } from "events"
  import { ElectronHttpExecutor } from "electron-updater/out/electronHttpExecutor"
  import { FileInfo, Logger, UpdateCheckResult, UpdaterSignal } from "electron-updater"

  export abstract class AppUpdater extends EventEmitter {
    /**
     * Whether to automatically download an update when it is found.
     */
    autoDownload: boolean
    /**
     * *GitHub provider only.* Whether to allow update to pre-release versions. Defaults to `true` if application version contains prerelease components (e.g. `0.12.1-alpha.1`, here `alpha` is a prerelease component), otherwise `false`.
     *
     * If `true`, downgrade will be allowed (`allowDowngrade` will be set to `true`).
     */
    allowPrerelease: boolean
    /**
     * Whether to allow version downgrade (when a user from the beta channel wants to go back to the stable channel).
     * @default false
     */
    allowDowngrade: boolean
    /**
     *  The request headers.
     */
    requestHeaders: RequestHeaders | null
    protected _logger: Logger
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    logger: Logger | null
    /**
     * For type safety you can use signals, e.g. `autoUpdater.signals.updateDownloaded(() => {})` instead of `autoUpdater.on('update-available', () => {})`
     */
    readonly signals: UpdaterSignal
    private _appUpdateConfigPath
    updateConfigPath: string | null
    protected updateAvailable: boolean
    private clientPromise
    private _stagingUserIdPromise
    protected readonly stagingUserIdPromise: Promise<string>
    private readonly untilAppReady
    private checkForUpdatesPromise
    protected readonly app: Electron.App
    protected versionInfo: VersionInfo | null
    private fileInfo
    private currentVersion
    protected readonly httpExecutor: ElectronHttpExecutor
    constructor(options: PublishConfiguration | null | undefined, app?: any)
    getFeedURL(): string | null | undefined
    /**
     * Configure update provider. If value is `string`, {@link module:electron-builder-http/out/publishOptions.GenericServerOptions} will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(options: PublishConfiguration | GenericServerOptions | S3Options | BintrayOptions | GithubOptions | string): void
    /**
     * Asks the server whether there is an update.
     */
    checkForUpdates(): Promise<UpdateCheckResult>
    private _checkForUpdates()
    private doCheckForUpdates()
    protected onUpdateAvailable(versionInfo: VersionInfo, fileInfo: FileInfo): void
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    downloadUpdate(cancellationToken?: CancellationToken): Promise<any>
    protected dispatchError(e: Error): void
    protected abstract doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): Promise<any>
    /**
     * Restarts the app and installs the update after it has been downloaded.
     * It should only be called after `update-downloaded` has been emitted.
     *
     * **Note:** `autoUpdater.quitAndInstall()` will close all application windows first and only emit `before-quit` event on `app` after that.
     * This is different from the normal quit event sequence.
     *
     * @param isSilent *windows-only* Runs the installer in silent mode.
     */
    abstract quitAndInstall(isSilent?: boolean): void
    loadUpdateConfig(): Promise<any>
    /*** @private */
    protected computeRequestHeaders(fileInfo: FileInfo): RequestHeaders | null
    private createClient(data)
    private getOrCreateStagedUserId()
  }

  /** @private */
  export class NoOpLogger implements Logger {
    info(message?: any): void
    warn(message?: any): void
    error(message?: any): void
  }
}

declare module "electron-updater/out/MacUpdater" {
  import BluebirdPromise from "bluebird-lst"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { AppUpdater } from "electron-updater/out/AppUpdater"
  import { FileInfo } from "electron-updater"

  export class MacUpdater extends AppUpdater {
    private readonly nativeUpdater
    constructor(options?: PublishConfiguration)
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): BluebirdPromise<void>
    private proxyUpdateFile(nativeResponse, fileInfo, errorHandler)
    quitAndInstall(): void
  }
}

declare module "electron-updater/out/NsisUpdater" {
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { AppUpdater } from "electron-updater/out/AppUpdater"
  import { FileInfo } from "electron-updater"

  export class NsisUpdater extends AppUpdater {
    private setupPath
    private quitAndInstallCalled
    private quitHandlerAdded
    constructor(options?: PublishConfiguration, app?: any)
    /*** @private */
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): Promise<string>
    private verifySignature(tempUpdateFile)
    private addQuitHandler()
    quitAndInstall(isSilent?: boolean): void
    private install(isSilent)
  }
}

