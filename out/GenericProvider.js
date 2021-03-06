"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GenericProvider = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _path = _interopRequireWildcard(require("path"));

var _url;

function _load_url() {
    return _url = _interopRequireWildcard(require("url"));
}

var _main;

function _load_main() {
    return _main = require("./main");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class GenericProvider extends (_main || _load_main()).Provider {
    constructor(configuration, executor) {
        super();
        this.configuration = configuration;
        this.executor = executor;
        this.baseUrl = (_url || _load_url()).parse(this.configuration.url);
        this.channel = this.configuration.channel ? (0, (_main || _load_main()).getCustomChannelName)(this.configuration.channel) : (0, (_main || _load_main()).getDefaultChannelName)();
    }
    getLatestVersion() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            let result;
            const channelFile = (0, (_main || _load_main()).getChannelFilename)(_this.channel);
            const pathname = _path.posix.resolve(_this.baseUrl.pathname || "/", channelFile);
            try {
                const options = {
                    hostname: _this.baseUrl.hostname,
                    path: `${pathname}${_this.baseUrl.search || ""}`,
                    protocol: _this.baseUrl.protocol,
                    headers: _this.requestHeaders || undefined
                };
                if (_this.baseUrl.port != null) {
                    options.port = parseInt(_this.baseUrl.port, 10);
                }
                result = (0, (_jsYaml || _load_jsYaml()).safeLoad)((yield _this.executor.request(options)));
            } catch (e) {
                if (e instanceof (_electronBuilderHttp || _load_electronBuilderHttp()).HttpError && e.response.statusCode === 404) {
                    throw new Error(`Cannot find channel "${channelFile}" update info: ${e.stack || e.message}`);
                }
                throw e;
            }
            (_main || _load_main()).Provider.validateUpdateInfo(result);
            if ((0, (_main || _load_main()).isUseOldMacProvider)()) {
                result.releaseJsonUrl = (_url || _load_url()).format(Object.assign({}, _this.baseUrl, { pathname: pathname }));
            }
            return result;
        })();
    }
    getUpdateFile(versionInfo) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if ((0, (_main || _load_main()).isUseOldMacProvider)()) {
                return versionInfo;
            }
            return {
                name: _path.posix.basename(versionInfo.path),
                url: (_url || _load_url()).format(Object.assign({}, _this2.baseUrl, { pathname: _path.posix.resolve(_this2.baseUrl.pathname || "/", versionInfo.path) })),
                sha2: versionInfo.sha2,
                sha512: versionInfo.sha512
            };
        })();
    }
}
exports.GenericProvider = GenericProvider; //# sourceMappingURL=GenericProvider.js.map