"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MacUpdater = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = _interopRequireDefault(require("bluebird-lst"));
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _CancellationToken;

function _load_CancellationToken() {
    return _CancellationToken = require("electron-builder-http/out/CancellationToken");
}

var _ProgressCallbackTransform;

function _load_ProgressCallbackTransform() {
    return _ProgressCallbackTransform = require("electron-builder-http/out/ProgressCallbackTransform");
}

var _http;

function _load_http() {
    return _http = require("http");
}

var _url;

function _load_url() {
    return _url = require("url");
}

var _AppUpdater;

function _load_AppUpdater() {
    return _AppUpdater = require("./AppUpdater");
}

var _main;

function _load_main() {
    return _main = require("./main");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MacUpdater extends (_AppUpdater || _load_AppUpdater()).AppUpdater {
    constructor(options) {
        super(options);
        this.nativeUpdater = require("electron").autoUpdater;
        this.nativeUpdater.on("error", it => {
            this._logger.warn(it);
            this.emit("error", it);
        });
        this.nativeUpdater.on("update-downloaded", () => {
            this._logger.info(`New version ${this.versionInfo.version} has been downloaded`);
            this.emit((_main || _load_main()).UPDATE_DOWNLOADED, this.versionInfo);
        });
    }
    doDownloadUpdate(versionInfo, fileInfo, cancellationToken) {
        const server = (0, (_http || _load_http()).createServer)();
        server.on("close", () => {
            this._logger.info(`Proxy server for native Squirrel.Mac is closed (was started to download ${fileInfo.url})`);
        });
        function getServerUrl() {
            const address = server.address();
            return `http://${address.address}:${address.port}`;
        }
        return new (_bluebirdLst || _load_bluebirdLst()).default((resolve, reject) => {
            server.on("request", (request, response) => {
                const requestUrl = request.url;
                if (requestUrl === "/") {
                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.end(`{ "url": "${getServerUrl()}/app.zip" }`);
                } else if (requestUrl === "/app.zip") {
                    let errorOccurred = false;
                    response.on("finish", () => {
                        try {
                            setImmediate(() => server.close());
                        } finally {
                            if (!errorOccurred) {
                                resolve();
                            }
                        }
                    });
                    this.proxyUpdateFile(response, fileInfo, error => {
                        errorOccurred = true;
                        try {
                            response.writeHead(500);
                            response.end();
                        } finally {
                            reject(new Error(`Cannot download "${fileInfo.url}": ${error}`));
                        }
                    });
                } else {
                    response.writeHead(404);
                    response.end();
                }
            });
            server.listen(0, "127.0.0.1", 16, () => {
                this.nativeUpdater.setFeedURL(`${getServerUrl()}`, Object.assign({ "Cache-Control": "no-cache" }, this.computeRequestHeaders(fileInfo)));
                this.nativeUpdater.checkForUpdates();
            });
        });
    }
    proxyUpdateFile(nativeResponse, fileInfo, errorHandler) {
        nativeResponse.writeHead(200, { "Content-Type": "application/zip" });
        const parsedUrl = (0, (_url || _load_url()).parse)(fileInfo.url);
        const downloadRequest = this.httpExecutor.doRequest((0, (_electronBuilderHttp || _load_electronBuilderHttp()).configureRequestOptions)({
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : undefined,
            headers: this.computeRequestHeaders(fileInfo) || undefined
        }), downloadResponse => {
            if (downloadResponse.statusCode >= 400) {
                try {
                    nativeResponse.writeHead(404);
                    nativeResponse.end();
                } finally {
                    this.emit("error", new Error(`Cannot download "${fileInfo.url}", status ${downloadResponse.statusCode}: ${downloadResponse.statusMessage}`));
                }
                return;
            }
            const streams = [];
            if (this.listenerCount((_main || _load_main()).DOWNLOAD_PROGRESS) > 0) {
                const contentLength = (0, (_electronBuilderHttp || _load_electronBuilderHttp()).safeGetHeader)(downloadResponse, "content-length");
                if (contentLength != null) {
                    streams.push(new (_ProgressCallbackTransform || _load_ProgressCallbackTransform()).ProgressCallbackTransform(parseInt(contentLength, 10), new (_CancellationToken || _load_CancellationToken()).CancellationToken(), it => this.emit((_main || _load_main()).DOWNLOAD_PROGRESS, it)));
                }
            }
            // for mac only sha512 is produced (sha256 is published for windows only to preserve backward compatibility)
            const sha512 = fileInfo.sha512;
            if (sha512 != null) {
                // "hex" to easy migrate to new base64 encoded hash (we already produces latest-mac.yml with hex encoded hash)
                streams.push(new (_electronBuilderHttp || _load_electronBuilderHttp()).DigestTransform(sha512, "sha512", sha512.length === 128 && !(sha512.indexOf("+") !== -1) && !(sha512.indexOf("Z") !== -1) && !(sha512.indexOf("=") !== -1) ? "hex" : "base64"));
            }
            streams.push(nativeResponse);
            let lastStream = downloadResponse;
            for (const stream of streams) {
                stream.on("error", errorHandler);
                lastStream = lastStream.pipe(stream);
            }
        });
        downloadRequest.on("error", errorHandler);
        downloadRequest.end();
    }
    quitAndInstall() {
        this.nativeUpdater.quitAndInstall();
    }
}
exports.MacUpdater = MacUpdater; //# sourceMappingURL=MacUpdater.js.map