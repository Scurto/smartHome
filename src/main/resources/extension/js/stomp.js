const e = {LF: "\n", NULL: "\0"};

class FrameImpl {
    constructor(e) {
        const {command: t, headers: s, body: n, binaryBody: i, escapeHeaderValues: o, skipContentLengthHeader: r} = e;
        this.command = t;
        this.headers = Object.assign({}, s || {});
        if (i) {
            this._binaryBody = i;
            this.isBinaryBody = true
        } else {
            this._body = n || "";
            this.isBinaryBody = false
        }
        this.escapeHeaderValues = o || false;
        this.skipContentLengthHeader = r || false
    }

    get body() {
        !this._body && this.isBinaryBody && (this._body = (new TextDecoder).decode(this._binaryBody));
        return this._body || ""
    }

    get binaryBody() {
        this._binaryBody || this.isBinaryBody || (this._binaryBody = (new TextEncoder).encode(this._body));
        return this._binaryBody
    }

    static fromRawFrame(e, t) {
        const s = {};
        const trim = e => e.replace(/^\s+|\s+$/g, "");
        for (const n of e.headers.reverse()) {
            n.indexOf(":");
            const i = trim(n[0]);
            let o = trim(n[1]);
            t && "CONNECT" !== e.command && "CONNECTED" !== e.command && (o = FrameImpl.hdrValueUnEscape(o));
            s[i] = o
        }
        return new FrameImpl({command: e.command, headers: s, binaryBody: e.binaryBody, escapeHeaderValues: t})
    }

    toString() {
        return this.serializeCmdAndHeaders()
    }

    serialize() {
        const t = this.serializeCmdAndHeaders();
        return this.isBinaryBody ? FrameImpl.toUnit8Array(t, this._binaryBody).buffer : t + this._body + e.NULL
    }

    serializeCmdAndHeaders() {
        const t = [this.command];
        this.skipContentLengthHeader && delete this.headers["content-length"];
        for (const e of Object.keys(this.headers || {})) {
            const s = this.headers[e];
            this.escapeHeaderValues && "CONNECT" !== this.command && "CONNECTED" !== this.command ? t.push(`${e}:${FrameImpl.hdrValueEscape(`${s}`)}`) : t.push(`${e}:${s}`)
        }
        (this.isBinaryBody || !this.isBodyEmpty() && !this.skipContentLengthHeader) && t.push(`content-length:${this.bodyLength()}`);
        return t.join(e.LF) + e.LF + e.LF
    }

    isBodyEmpty() {
        return 0 === this.bodyLength()
    }

    bodyLength() {
        const e = this.binaryBody;
        return e ? e.length : 0
    }

    static sizeOfUTF8(e) {
        return e ? (new TextEncoder).encode(e).length : 0
    }

    static toUnit8Array(e, t) {
        const s = (new TextEncoder).encode(e);
        const n = new Uint8Array([0]);
        const i = new Uint8Array(s.length + t.length + n.length);
        i.set(s);
        i.set(t, s.length);
        i.set(n, s.length + t.length);
        return i
    }

    static marshall(e) {
        const t = new FrameImpl(e);
        return t.serialize()
    }

    static hdrValueEscape(e) {
        return e.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c")
    }

    static hdrValueUnEscape(e) {
        return e.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\")
    }
}

const t = 0;
const s = 10;
const n = 13;
const i = 58;

class Parser {
    constructor(e, t) {
        this.onFrame = e;
        this.onIncomingPing = t;
        this._encoder = new TextEncoder;
        this._decoder = new TextDecoder;
        this._token = [];
        this._initState()
    }

    parseChunk(e, t = false) {
        let s;
        s = "string" === typeof e ? this._encoder.encode(e) : new Uint8Array(e);
        if (t && 0 !== s[s.length - 1]) {
            const e = new Uint8Array(s.length + 1);
            e.set(s, 0);
            e[s.length] = 0;
            s = e
        }
        for (let e = 0; e < s.length; e++) {
            const t = s[e];
            this._onByte(t)
        }
    }

    _collectFrame(e) {
        if (e !== t && e !== n) if (e !== s) {
            this._onByte = this._collectCommand;
            this._reinjectByte(e)
        } else this.onIncomingPing()
    }

    _collectCommand(e) {
        if (e !== n) if (e !== s) this._consumeByte(e); else {
            this._results.command = this._consumeTokenAsUTF8();
            this._onByte = this._collectHeaders
        }
    }

    _collectHeaders(e) {
        if (e !== n) if (e !== s) {
            this._onByte = this._collectHeaderKey;
            this._reinjectByte(e)
        } else this._setupCollectBody()
    }

    _reinjectByte(e) {
        this._onByte(e)
    }

    _collectHeaderKey(e) {
        if (e !== i) this._consumeByte(e); else {
            this._headerKey = this._consumeTokenAsUTF8();
            this._onByte = this._collectHeaderValue
        }
    }

    _collectHeaderValue(e) {
        if (e !== n) if (e !== s) this._consumeByte(e); else {
            this._results.headers.push([this._headerKey, this._consumeTokenAsUTF8()]);
            this._headerKey = void 0;
            this._onByte = this._collectHeaders
        }
    }

    _setupCollectBody() {
        const e = this._results.headers.filter((e => "content-length" === e[0]))[0];
        if (e) {
            this._bodyBytesRemaining = parseInt(e[1], 10);
            this._onByte = this._collectBodyFixedSize
        } else this._onByte = this._collectBodyNullTerminated
    }

    _collectBodyNullTerminated(e) {
        e !== t ? this._consumeByte(e) : this._retrievedBody()
    }

    _collectBodyFixedSize(e) {
        0 !== this._bodyBytesRemaining-- ? this._consumeByte(e) : this._retrievedBody()
    }

    _retrievedBody() {
        this._results.binaryBody = this._consumeTokenAsRaw();
        try {
            this.onFrame(this._results)
        } catch (e) {
            console.log("Ignoring an exception thrown by a frame handler. Original exception: ", e)
        }
        this._initState()
    }

    _consumeByte(e) {
        this._token.push(e)
    }

    _consumeTokenAsUTF8() {
        return this._decoder.decode(this._consumeTokenAsRaw())
    }

    _consumeTokenAsRaw() {
        const e = new Uint8Array(this._token);
        this._token = [];
        return e
    }

    _initState() {
        this._results = {command: void 0, headers: [], binaryBody: void 0};
        this._token = [];
        this._headerKey = void 0;
        this._onByte = this._collectFrame
    }
}

var o;
(function (e) {
    e[e.CONNECTING = 0] = "CONNECTING";
    e[e.OPEN = 1] = "OPEN";
    e[e.CLOSING = 2] = "CLOSING";
    e[e.CLOSED = 3] = "CLOSED"
})(o = o || (o = {}));
var r;
(function (e) {
    e[e.ACTIVE = 0] = "ACTIVE";
    e[e.DEACTIVATING = 1] = "DEACTIVATING";
    e[e.INACTIVE = 2] = "INACTIVE"
})(r = r || (r = {}));

class Versions {
    constructor(e) {
        this.versions = e
    }

    supportedVersions() {
        return this.versions.join(",")
    }

    protocolVersions() {
        return this.versions.map((e => `v${e.replace(".", "")}.stomp`))
    }
}

Versions.V1_0 = "1.0";
Versions.V1_1 = "1.1";
Versions.V1_2 = "1.2";
Versions.default = new Versions([Versions.V1_2, Versions.V1_1, Versions.V1_0]);

function augmentWebsocket(e, t) {
    e.terminate = function () {
        const noOp = () => {
        };
        this.onerror = noOp;
        this.onmessage = noOp;
        this.onopen = noOp;
        const s = new Date;
        const n = Math.random().toString().substring(2, 8);
        const i = this.onclose;
        this.onclose = e => {
            const i = (new Date).getTime() - s.getTime();
            t(`Discarded socket (#${n})  closed after ${i}ms, with code/reason: ${e.code}/${e.reason}`)
        };
        this.close();
        i?.call(e, {
            code: 4001,
            reason: `Quick discarding socket (#${n}) without waiting for the shutdown sequence.`,
            wasClean: false
        })
    }
}

class StompHandler {
    constructor(e, t, s) {
        this._client = e;
        this._webSocket = t;
        this._connected = false;
        this._serverFrameHandlers = {
            CONNECTED: e => {
                this.debug(`connected to server ${e.headers.server}`);
                this._connected = true;
                this._connectedVersion = e.headers.version;
                this._connectedVersion === Versions.V1_2 && (this._escapeHeaderValues = true);
                this._setupHeartbeat(e.headers);
                this.onConnect(e)
            }, MESSAGE: e => {
                const t = e.headers.subscription;
                const s = this._subscriptions[t] || this.onUnhandledMessage;
                const n = e;
                const i = this;
                const o = this._connectedVersion === Versions.V1_2 ? n.headers.ack : n.headers["message-id"];
                n.ack = (e = {}) => i.ack(o, t, e);
                n.nack = (e = {}) => i.nack(o, t, e);
                s(n)
            }, RECEIPT: e => {
                const t = this._receiptWatchers[e.headers["receipt-id"]];
                if (t) {
                    t(e);
                    delete this._receiptWatchers[e.headers["receipt-id"]]
                } else this.onUnhandledReceipt(e)
            }, ERROR: e => {
                this.onStompError(e)
            }
        };
        this._counter = 0;
        this._subscriptions = {};
        this._receiptWatchers = {};
        this._partialData = "";
        this._escapeHeaderValues = false;
        this._lastServerActivityTS = Date.now();
        this.debug = s.debug;
        this.stompVersions = s.stompVersions;
        this.connectHeaders = s.connectHeaders;
        this.disconnectHeaders = s.disconnectHeaders;
        this.heartbeatIncoming = s.heartbeatIncoming;
        this.heartbeatOutgoing = s.heartbeatOutgoing;
        this.splitLargeFrames = s.splitLargeFrames;
        this.maxWebSocketChunkSize = s.maxWebSocketChunkSize;
        this.forceBinaryWSFrames = s.forceBinaryWSFrames;
        this.logRawCommunication = s.logRawCommunication;
        this.appendMissingNULLonIncoming = s.appendMissingNULLonIncoming;
        this.discardWebsocketOnCommFailure = s.discardWebsocketOnCommFailure;
        this.onConnect = s.onConnect;
        this.onDisconnect = s.onDisconnect;
        this.onStompError = s.onStompError;
        this.onWebSocketClose = s.onWebSocketClose;
        this.onWebSocketError = s.onWebSocketError;
        this.onUnhandledMessage = s.onUnhandledMessage;
        this.onUnhandledReceipt = s.onUnhandledReceipt;
        this.onUnhandledFrame = s.onUnhandledFrame
    }

    get connectedVersion() {
        return this._connectedVersion
    }

    get connected() {
        return this._connected
    }

    start() {
        const e = new Parser((e => {
            const t = FrameImpl.fromRawFrame(e, this._escapeHeaderValues);
            this.logRawCommunication || this.debug(`<<< ${t}`);
            const s = this._serverFrameHandlers[t.command] || this.onUnhandledFrame;
            s(t)
        }), (() => {
            this.debug("<<< PONG")
        }));
        this._webSocket.onmessage = t => {
            this.debug("Received data");
            this._lastServerActivityTS = Date.now();
            if (this.logRawCommunication) {
                const e = t.data instanceof ArrayBuffer ? (new TextDecoder).decode(t.data) : t.data;
                this.debug(`<<< ${e}`)
            }
            e.parseChunk(t.data, this.appendMissingNULLonIncoming)
        };
        this._webSocket.onclose = e => {
            this.debug(`Connection closed to ${this._webSocket.url}`);
            this._cleanUp();
            this.onWebSocketClose(e)
        };
        this._webSocket.onerror = e => {
            this.onWebSocketError(e)
        };
        this._webSocket.onopen = () => {
            const e = Object.assign({}, this.connectHeaders);
            this.debug("Web Socket Opened...");
            e["accept-version"] = this.stompVersions.supportedVersions();
            e["heart-beat"] = [this.heartbeatOutgoing, this.heartbeatIncoming].join(",");
            this._transmit({command: "CONNECT", headers: e})
        }
    }

    _setupHeartbeat(t) {
        if (t.version !== Versions.V1_1 && t.version !== Versions.V1_2) return;
        if (!t["heart-beat"]) return;
        const [s, n] = t["heart-beat"].split(",").map((e => parseInt(e, 10)));
        if (0 !== this.heartbeatOutgoing && 0 !== n) {
            const t = Math.max(this.heartbeatOutgoing, n);
            this.debug(`send PING every ${t}ms`);
            this._pinger = setInterval((() => {
                if (this._webSocket.readyState === o.OPEN) {
                    this._webSocket.send(e.LF);
                    this.debug(">>> PING")
                }
            }), t)
        }
        if (0 !== this.heartbeatIncoming && 0 !== s) {
            const e = Math.max(this.heartbeatIncoming, s);
            this.debug(`check PONG every ${e}ms`);
            this._ponger = setInterval((() => {
                const t = Date.now() - this._lastServerActivityTS;
                if (t > 2 * e) {
                    this.debug(`did not receive server activity for the last ${t}ms`);
                    this._closeOrDiscardWebsocket()
                }
            }), e)
        }
    }

    _closeOrDiscardWebsocket() {
        if (this.discardWebsocketOnCommFailure) {
            this.debug("Discarding websocket, the underlying socket may linger for a while");
            this.discardWebsocket()
        } else {
            this.debug("Issuing close on the websocket");
            this._closeWebsocket()
        }
    }

    forceDisconnect() {
        this._webSocket && (this._webSocket.readyState !== o.CONNECTING && this._webSocket.readyState !== o.OPEN || this._closeOrDiscardWebsocket())
    }

    _closeWebsocket() {
        this._webSocket.onmessage = () => {
        };
        this._webSocket.close()
    }

    discardWebsocket() {
        "function" !== typeof this._webSocket.terminate && augmentWebsocket(this._webSocket, (e => this.debug(e)));
        this._webSocket.terminate()
    }

    _transmit(e) {
        const {command: t, headers: s, body: n, binaryBody: i, skipContentLengthHeader: o} = e;
        const r = new FrameImpl({
            command: t,
            headers: s,
            body: n,
            binaryBody: i,
            escapeHeaderValues: this._escapeHeaderValues,
            skipContentLengthHeader: o
        });
        let c = r.serialize();
        this.logRawCommunication ? this.debug(`>>> ${c}`) : this.debug(`>>> ${r}`);
        this.forceBinaryWSFrames && "string" === typeof c && (c = (new TextEncoder).encode(c));
        if ("string" === typeof c && this.splitLargeFrames) {
            let e = c;
            while (e.length > 0) {
                const t = e.substring(0, this.maxWebSocketChunkSize);
                e = e.substring(this.maxWebSocketChunkSize);
                this._webSocket.send(t);
                this.debug(`chunk sent = ${t.length}, remaining = ${e.length}`)
            }
        } else this._webSocket.send(c)
    }

    dispose() {
        if (this.connected) try {
            const e = Object.assign({}, this.disconnectHeaders);
            e.receipt || (e.receipt = "close-" + this._counter++);
            this.watchForReceipt(e.receipt, (e => {
                this._closeWebsocket();
                this._cleanUp();
                this.onDisconnect(e)
            }));
            this._transmit({command: "DISCONNECT", headers: e})
        } catch (e) {
            this.debug(`Ignoring error during disconnect ${e}`)
        } else this._webSocket.readyState !== o.CONNECTING && this._webSocket.readyState !== o.OPEN || this._closeWebsocket()
    }

    _cleanUp() {
        this._connected = false;
        if (this._pinger) {
            clearInterval(this._pinger);
            this._pinger = void 0
        }
        if (this._ponger) {
            clearInterval(this._ponger);
            this._ponger = void 0
        }
    }

    publish(e) {
        const {destination: t, headers: s, body: n, binaryBody: i, skipContentLengthHeader: o} = e;
        const r = Object.assign({destination: t}, s);
        this._transmit({command: "SEND", headers: r, body: n, binaryBody: i, skipContentLengthHeader: o})
    }

    watchForReceipt(e, t) {
        this._receiptWatchers[e] = t
    }

    subscribe(e, t, s = {}) {
        s = Object.assign({}, s);
        s.id || (s.id = "sub-" + this._counter++);
        s.destination = e;
        this._subscriptions[s.id] = t;
        this._transmit({command: "SUBSCRIBE", headers: s});
        const n = this;
        return {
            id: s.id, unsubscribe(e) {
                return n.unsubscribe(s.id, e)
            }
        }
    }

    unsubscribe(e, t = {}) {
        t = Object.assign({}, t);
        delete this._subscriptions[e];
        t.id = e;
        this._transmit({command: "UNSUBSCRIBE", headers: t})
    }

    begin(e) {
        const t = e || "tx-" + this._counter++;
        this._transmit({command: "BEGIN", headers: {transaction: t}});
        const s = this;
        return {
            id: t, commit() {
                s.commit(t)
            }, abort() {
                s.abort(t)
            }
        }
    }

    commit(e) {
        this._transmit({command: "COMMIT", headers: {transaction: e}})
    }

    abort(e) {
        this._transmit({command: "ABORT", headers: {transaction: e}})
    }

    ack(e, t, s = {}) {
        s = Object.assign({}, s);
        this._connectedVersion === Versions.V1_2 ? s.id = e : s["message-id"] = e;
        s.subscription = t;
        this._transmit({command: "ACK", headers: s})
    }

    nack(e, t, s = {}) {
        s = Object.assign({}, s);
        this._connectedVersion === Versions.V1_2 ? s.id = e : s["message-id"] = e;
        s.subscription = t;
        return this._transmit({command: "NACK", headers: s})
    }
}

class Client {
    constructor(e = {}) {
        this.stompVersions = Versions.default;
        this.connectionTimeout = 0;
        this.reconnectDelay = 5e3;
        this.heartbeatIncoming = 1e4;
        this.heartbeatOutgoing = 1e4;
        this.splitLargeFrames = false;
        this.maxWebSocketChunkSize = 8192;
        this.forceBinaryWSFrames = false;
        this.appendMissingNULLonIncoming = false;
        this.discardWebsocketOnCommFailure = false;
        this.state = r.INACTIVE;
        const noOp = () => {
        };
        this.debug = noOp;
        this.beforeConnect = noOp;
        this.onConnect = noOp;
        this.onDisconnect = noOp;
        this.onUnhandledMessage = noOp;
        this.onUnhandledReceipt = noOp;
        this.onUnhandledFrame = noOp;
        this.onStompError = noOp;
        this.onWebSocketClose = noOp;
        this.onWebSocketError = noOp;
        this.logRawCommunication = false;
        this.onChangeState = noOp;
        this.connectHeaders = {};
        this._disconnectHeaders = {};
        this.configure(e)
    }

    get webSocket() {
        return this._stompHandler?._webSocket
    }

    get disconnectHeaders() {
        return this._disconnectHeaders
    }

    set disconnectHeaders(e) {
        this._disconnectHeaders = e;
        this._stompHandler && (this._stompHandler.disconnectHeaders = this._disconnectHeaders)
    }

    get connected() {
        return !!this._stompHandler && this._stompHandler.connected
    }

    get connectedVersion() {
        return this._stompHandler ? this._stompHandler.connectedVersion : void 0
    }

    get active() {
        return this.state === r.ACTIVE
    }

    _changeState(e) {
        this.state = e;
        this.onChangeState(e)
    }

    configure(e) {
        Object.assign(this, e)
    }

    activate() {
        const _activate = () => {
            if (this.active) this.debug("Already ACTIVE, ignoring request to activate"); else {
                this._changeState(r.ACTIVE);
                this._connect()
            }
        };
        if (this.state === r.DEACTIVATING) {
            this.debug("Waiting for deactivation to finish before activating");
            this.deactivate().then((() => {
                _activate()
            }))
        } else _activate()
    }

    async _connect() {
        await this.beforeConnect();
        if (this._stompHandler) {
            this.debug("There is already a stompHandler, skipping the call to connect");
            return
        }
        if (!this.active) {
            this.debug("Client has been marked inactive, will not attempt to connect");
            return
        }
        if (this.connectionTimeout > 0) {
            this._connectionWatcher && clearTimeout(this._connectionWatcher);
            this._connectionWatcher = setTimeout((() => {
                if (!this.connected) {
                    this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
                    this.forceDisconnect()
                }
            }), this.connectionTimeout)
        }
        this.debug("Opening Web Socket...");
        const e = this._createWebSocket();
        this._stompHandler = new StompHandler(this, e, {
            debug: this.debug,
            stompVersions: this.stompVersions,
            connectHeaders: this.connectHeaders,
            disconnectHeaders: this._disconnectHeaders,
            heartbeatIncoming: this.heartbeatIncoming,
            heartbeatOutgoing: this.heartbeatOutgoing,
            splitLargeFrames: this.splitLargeFrames,
            maxWebSocketChunkSize: this.maxWebSocketChunkSize,
            forceBinaryWSFrames: this.forceBinaryWSFrames,
            logRawCommunication: this.logRawCommunication,
            appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
            discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
            onConnect: e => {
                if (this._connectionWatcher) {
                    clearTimeout(this._connectionWatcher);
                    this._connectionWatcher = void 0
                }
                if (this.active) this.onConnect(e); else {
                    this.debug("STOMP got connected while deactivate was issued, will disconnect now");
                    this._disposeStompHandler()
                }
            },
            onDisconnect: e => {
                this.onDisconnect(e)
            },
            onStompError: e => {
                this.onStompError(e)
            },
            onWebSocketClose: e => {
                this._stompHandler = void 0;
                this.state === r.DEACTIVATING && this._changeState(r.INACTIVE);
                this.onWebSocketClose(e);
                this.active && this._schedule_reconnect()
            },
            onWebSocketError: e => {
                this.onWebSocketError(e)
            },
            onUnhandledMessage: e => {
                this.onUnhandledMessage(e)
            },
            onUnhandledReceipt: e => {
                this.onUnhandledReceipt(e)
            },
            onUnhandledFrame: e => {
                this.onUnhandledFrame(e)
            }
        });
        this._stompHandler.start()
    }

    _createWebSocket() {
        let e;
        if (this.webSocketFactory) e = this.webSocketFactory(); else {
            if (!this.brokerURL) throw new Error("Either brokerURL or webSocketFactory must be provided");
            e = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions())
        }
        e.binaryType = "arraybuffer";
        return e
    }

    _schedule_reconnect() {
        if (this.reconnectDelay > 0) {
            this.debug(`STOMP: scheduling reconnection in ${this.reconnectDelay}ms`);
            this._reconnector = setTimeout((() => {
                this._connect()
            }), this.reconnectDelay)
        }
    }

    async deactivate(e = {}) {
        const t = e.force || false;
        const s = this.active;
        let n;
        if (this.state === r.INACTIVE) {
            this.debug("Already INACTIVE, nothing more to do");
            return Promise.resolve()
        }
        this._changeState(r.DEACTIVATING);
        if (this._reconnector) {
            clearTimeout(this._reconnector);
            this._reconnector = void 0
        }
        if (!this._stompHandler || this.webSocket.readyState === o.CLOSED) {
            this._changeState(r.INACTIVE);
            return Promise.resolve()
        }
        {
            const e = this._stompHandler.onWebSocketClose;
            n = new Promise(((t, s) => {
                this._stompHandler.onWebSocketClose = s => {
                    e(s);
                    t()
                }
            }))
        }
        t ? this._stompHandler?.discardWebsocket() : s && this._disposeStompHandler();
        return n
    }

    forceDisconnect() {
        this._stompHandler && this._stompHandler.forceDisconnect()
    }

    _disposeStompHandler() {
        this._stompHandler && this._stompHandler.dispose()
    }

    publish(e) {
        this._checkConnection();
        this._stompHandler.publish(e)
    }

    _checkConnection() {
        if (!this.connected) throw new TypeError("There is no underlying STOMP connection")
    }

    watchForReceipt(e, t) {
        this._checkConnection();
        this._stompHandler.watchForReceipt(e, t)
    }

    subscribe(e, t, s = {}) {
        this._checkConnection();
        return this._stompHandler.subscribe(e, t, s)
    }

    unsubscribe(e, t = {}) {
        this._checkConnection();
        this._stompHandler.unsubscribe(e, t)
    }

    begin(e) {
        this._checkConnection();
        return this._stompHandler.begin(e)
    }

    commit(e) {
        this._checkConnection();
        this._stompHandler.commit(e)
    }

    abort(e) {
        this._checkConnection();
        this._stompHandler.abort(e)
    }

    ack(e, t, s = {}) {
        this._checkConnection();
        this._stompHandler.ack(e, t, s)
    }

    nack(e, t, s = {}) {
        this._checkConnection();
        this._stompHandler.nack(e, t, s)
    }
}

class StompConfig {
}

class StompHeaders {
}

class HeartbeatInfo {
    constructor(e) {
        this.client = e
    }

    get outgoing() {
        return this.client.heartbeatOutgoing
    }

    set outgoing(e) {
        this.client.heartbeatOutgoing = e
    }

    get incoming() {
        return this.client.heartbeatIncoming
    }

    set incoming(e) {
        this.client.heartbeatIncoming = e
    }
}

class CompatClient extends Client {
    constructor(e) {
        super();
        this.maxWebSocketFrameSize = 16384;
        this._heartbeatInfo = new HeartbeatInfo(this);
        this.reconnect_delay = 0;
        this.webSocketFactory = e;
        this.debug = (...e) => {
            console.log(...e)
        }
    }

    _parseConnect(...e) {
        let t;
        let s;
        let n;
        let i = {};
        if (e.length < 2) throw new Error("Connect requires at least 2 arguments");
        if ("function" === typeof e[1]) [i, s, n, t] = e; else switch (e.length) {
            case 6:
                [i.login, i.passcode, s, n, t, i.host] = e;
                break;
            default:
                [i.login, i.passcode, s, n, t] = e
        }
        return [i, s, n, t]
    }

    connect(...e) {
        const t = this._parseConnect(...e);
        t[0] && (this.connectHeaders = t[0]);
        t[1] && (this.onConnect = t[1]);
        t[2] && (this.onStompError = t[2]);
        t[3] && (this.onWebSocketClose = t[3]);
        super.activate()
    }

    disconnect(e, t = {}) {
        e && (this.onDisconnect = e);
        this.disconnectHeaders = t;
        super.deactivate()
    }

    send(e, t = {}, s = "") {
        t = Object.assign({}, t);
        const n = false === t["content-length"];
        n && delete t["content-length"];
        this.publish({destination: e, headers: t, body: s, skipContentLengthHeader: n})
    }

    set reconnect_delay(e) {
        this.reconnectDelay = e
    }

    get ws() {
        return this.webSocket
    }

    get version() {
        return this.connectedVersion
    }

    get onreceive() {
        return this.onUnhandledMessage
    }

    set onreceive(e) {
        this.onUnhandledMessage = e
    }

    get onreceipt() {
        return this.onUnhandledReceipt
    }

    set onreceipt(e) {
        this.onUnhandledReceipt = e
    }

    get heartbeat() {
        return this._heartbeatInfo
    }

    set heartbeat(e) {
        this.heartbeatIncoming = e.incoming;
        this.heartbeatOutgoing = e.outgoing
    }
}

class Stomp {
    static client(e, t) {
        null == t && (t = Versions.default.protocolVersions());
        const wsFn = () => {
            const s = Stomp.WebSocketClass || WebSocket;
            return new s(e, t)
        };
        return new CompatClient(wsFn)
    }

    static over(e) {
        let t;
        if ("function" === typeof e) t = e; else {
            console.warn("Stomp.over did not receive a factory, auto reconnect will not work. Please see https://stomp-js.github.io/api-docs/latest/classes/Stomp.html#over");
            t = () => e
        }
        return new CompatClient(t)
    }
}

Stomp.WebSocketClass = null;
export {
    r as ActivationState,
    Client,
    CompatClient,
    FrameImpl,
    Parser,
    Stomp,
    StompConfig,
    StompHeaders,
    o as StompSocketState,
    Versions
};

//# sourceMappingURL=index.js.map