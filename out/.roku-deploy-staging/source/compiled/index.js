;(function(){
if(typeof WebAssembly==='undefined'){globalThis.WebAssembly={compile:function(){return Promise.reject(new Error('WebAssembly not supported'));},compileStreaming:function(){return Promise.reject(new Error('WebAssembly not supported'));},instantiate:function(){return Promise.reject(new Error('WebAssembly not supported'));},instantiateStreaming:function(){return Promise.reject(new Error('WebAssembly not supported'));},validate:function(){return false;}}}
if(typeof require==='undefined'){globalThis.require=function(){return {};};}
}());
"use strict";
(() => {
  // node_modules/.pnpm/@roku-sdk+runtime@2.19.1/node_modules/@roku-sdk/runtime/src/has-feature.ts
  var featureSupport = /* @__PURE__ */ new Map();
  function hasFeature(key) {
    const cached = featureSupport.get(key);
    if (cached !== void 0)
      return cached;
    const supported = typeof roku !== "undefined" && typeof roku?.hasFeature === "function" ? roku.hasFeature(key) : false;
    featureSupport.set(key, supported);
    return supported;
  }

  // node_modules/.pnpm/@roku-sdk+interfaces@2.19.1/node_modules/@roku-sdk/interfaces/src/roku-compat.ts
  var COMPAT_MARKER = "__rsgCompat";
  function installRokuCompat() {
    const g = globalThis;
    const real = g.roku;
    if (real && real[COMPAT_MARKER]) {
      return;
    }
    const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    const compat = new Proxy({}, {
      // Resolution order: local writes/overrides on the proxy → firmware-provided
      // `roku` member → legacy bare global (firmware without the `roku` namespace).
      get(target, prop) {
        if (prop === COMPAT_MARKER) {
          return true;
        }
        if (hasOwn(target, prop)) {
          return target[prop];
        }
        if (real && real[prop] !== void 0) {
          return real[prop];
        }
        return g[prop];
      },
      has(target, prop) {
        if (prop === COMPAT_MARKER) {
          return true;
        }
        return hasOwn(target, prop) || !!real && prop in real || prop in g;
      }
    });
    g.roku = compat;
  }
  installRokuCompat();

  // node_modules/.pnpm/@roku-sdk+interfaces@2.19.1/node_modules/@roku-sdk/interfaces/src/runtime/enums.ts
  var RuntimeInterfaces = /* @__PURE__ */ (function(RuntimeInterfaces2) {
    RuntimeInterfaces2["CEC"] = "CEC";
    RuntimeInterfaces2["LaunchConfig"] = "LaunchConfig";
    RuntimeInterfaces2["Registry"] = "Registry";
    RuntimeInterfaces2["AppInfo"] = "AppInfo";
    RuntimeInterfaces2["DeviceInfo"] = "DeviceInfo";
    RuntimeInterfaces2["LoggerAPI"] = "LoggerAPI";
    RuntimeInterfaces2["AppMemoryMonitor"] = "AppMemoryMonitor";
    RuntimeInterfaces2["Input"] = "Input";
    RuntimeInterfaces2["LifecycleAPI"] = "LifecycleAPI";
    RuntimeInterfaces2["FileSystem"] = "FileSystem";
    RuntimeInterfaces2["FontMeasureApi"] = "FontMeasureApi";
    RuntimeInterfaces2["SignalBeacon"] = "SignalBeacon";
    RuntimeInterfaces2["AudioGuide"] = "AudioGuide";
    RuntimeInterfaces2["TextToSpeech"] = "TextToSpeech";
    RuntimeInterfaces2["ComponentLibraryFactory"] = "ComponentLibraryFactory";
    RuntimeInterfaces2["HdmiStatus"] = "HdmiStatus";
    return RuntimeInterfaces2;
  })({});

  // node_modules/.pnpm/@roku-sdk+interfaces@2.19.1/node_modules/@roku-sdk/interfaces/src/types.ts
  var domNodeSymbol = /* @__PURE__ */ Symbol("domNode");

  // node_modules/.pnpm/@roku-sdk+common@2.19.1/node_modules/@roku-sdk/common/src/build-variables.ts
  function getBuildVariable(variable, fallback) {
    return typeof variable !== "undefined" && variable !== "" ? variable : fallback;
  }

  // node_modules/.pnpm/@roku-sdk+common@2.19.1/node_modules/@roku-sdk/common/src/logger.ts
  var { getRuntimeSingletonSync, LogLevel } = roku;
  var loggerAPI = getRuntimeSingletonSync(RuntimeInterfaces.LoggerAPI);
  var baseLogLevelStr = getBuildVariable("INFO", "INFO");
  var currentLogLevelStr = getBuildVariable("ERROR", "ERROR");
  var baseLevel = LogLevel[baseLogLevelStr.toUpperCase()] ?? LogLevel.INFO;
  var currentLevel = LogLevel[currentLogLevelStr.toUpperCase()] ?? LogLevel.ERROR;
  var logSourceFilter = null;
  function createLogger(source = "") {
    const loggerRef = loggerAPI.getLoggerRef(source);
    const logHandlers = [];
    function logByLevel(loggerRef2, level, messageProvider, logSourceSuffix) {
      if (baseLevel <= level && currentLevel <= level && (logSourceFilter === null || source.startsWith(logSourceFilter))) {
        const message = messageProvider();
        loggerAPI.logDevConsole(loggerRef2, level, message, logSourceSuffix);
        for (const handler of logHandlers) {
          handler(source, level, message);
        }
      }
    }
    const logger2 = {
      trace: (messageProvider, logSourceSuffix) => {
        logByLevel(loggerRef, LogLevel.TRACE, messageProvider, logSourceSuffix);
      },
      debug: (messageProvider, logSourceSuffix) => {
        logByLevel(loggerRef, LogLevel.DEBUG, messageProvider, logSourceSuffix);
      },
      info: (messageProvider, logSourceSuffix) => {
        logByLevel(loggerRef, LogLevel.INFO, messageProvider, logSourceSuffix);
      },
      warn: (messageProvider, logSourceSuffix) => {
        logByLevel(loggerRef, LogLevel.WARN, messageProvider, logSourceSuffix);
      },
      error: (messageProvider, logSourceSuffix) => {
        logByLevel(loggerRef, LogLevel.ERROR, messageProvider, logSourceSuffix);
      },
      getLogger: (childSource) => {
        return createLogger(source ? `${source}.${childSource}` : childSource);
      },
      // Log handler registration methods
      registerLogHandler: (handler) => {
        logHandlers.push(handler);
      },
      unregisterLogHandler: (handler) => {
        const index = logHandlers.indexOf(handler);
        if (index !== -1) {
          logHandlers.splice(index, 1);
        }
      },
      __loggerRef: loggerRef
    };
    ;
    return logger2;
  }
  var logger = createLogger();

  // node_modules/.pnpm/@roku-sdk+common@2.19.1/node_modules/@roku-sdk/common/src/sd-helper.ts
  var sdLogger = logger.getLogger("sd");
  var createSDHelper = (api) => {
    const createFullObject2 = (props, tracked = /* @__PURE__ */ new WeakSet()) => {
      if (tracked.has(props)) {
        sdLogger.error(() => "Circular reference detected in object");
        throw new Error("Circular reference detected in object");
      }
      tracked.add(props);
      const objRef = api.createObject();
      Object.entries(props).forEach(([prop, value]) => {
        switch (typeof value) {
          case "number":
            if (Number.isInteger(value)) {
              api.insertInt(objRef, prop, value);
            } else {
              api.insertFloat(objRef, prop, value);
            }
            break;
          case "boolean":
            api.insertBool(objRef, prop, value);
            break;
          case "string":
            api.insertString(objRef, prop, value);
            break;
          case "object":
            if (value === null) {
              api.insertNull(objRef, prop);
            } else if (Array.isArray(value)) {
              const arrayRef = createFullArray2(value, tracked);
              api.insertArray(objRef, prop, arrayRef);
            } else {
              const objectRef = createFullObject2(value, tracked);
              api.insertObject(objRef, prop, objectRef);
            }
            break;
        }
      });
      return objRef;
    };
    const createFullArray2 = (array, tracked = /* @__PURE__ */ new WeakSet()) => {
      ;
      if (tracked.has(array)) {
        sdLogger.error(() => "Circular reference detected in array");
        throw new Error("Circular reference detected in array");
      }
      tracked.add(array);
      const arrayRef = api.createArray();
      array.forEach((value) => {
        switch (typeof value) {
          case "boolean":
            api.appendBool(arrayRef, value);
            break;
          case "number":
            if (Number.isInteger(value)) {
              api.appendInt(arrayRef, value);
            } else {
              api.appendFloat(arrayRef, value);
            }
            break;
          case "string":
            api.appendString(arrayRef, value);
            break;
          case "object":
            if (value === null) {
              api.appendNull(arrayRef);
            } else if (Array.isArray(value)) {
              const nestedArrayRef = createFullArray2(value, tracked);
              api.appendArray(arrayRef, nestedArrayRef);
            } else {
              const objectRef = createFullObject2(value, tracked);
              api.appendObject(arrayRef, objectRef);
            }
            break;
        }
      });
      return arrayRef;
    };
    const commit = () => {
    };
    return {
      createFullObject: createFullObject2,
      createFullArray: createFullArray2,
      commit
    };
  };

  // node_modules/.pnpm/@roku-sdk+common@2.19.1/node_modules/@roku-sdk/common/src/string-interner.ts
  var internStringApi;
  var reverseMap;
  var forwardMap;
  function registerInternStringApi(i) {
    reverseMap = /* @__PURE__ */ new Map();
    forwardMap = /* @__PURE__ */ new Map();
    internStringApi = i;
  }
  function assertInternStringApi() {
    if (!internStringApi) {
      throw new Error("InternStringApi not registered");
    }
  }
  var stringInterner = {
    internString: (str) => {
      assertInternStringApi();
      let ref = forwardMap.get(str);
      if (ref) {
        return ref;
      }
      ref = internStringApi.internString(str);
      forwardMap.set(str, ref);
      reverseMap.set(ref, str);
      return ref;
    },
    getStringByInternedRef: (ref) => {
      assertInternStringApi();
      const str = reverseMap.get(ref);
      if (!str) {
        throw new Error(`String for ref ${ref} not found`);
      }
      return str;
    }
  };

  // node_modules/.pnpm/@roku-sdk+common@2.19.1/node_modules/@roku-sdk/common/src/transaction.ts
  var transactionApi;
  var transaction = void 0;
  var precommitHooks = [];
  var transactionStartHooks = [];
  var txLogger = logger.getLogger("tx");
  function registerTransactionApi(incomingTransactionApi) {
    transactionApi = incomingTransactionApi;
  }
  function registerPreCommitHook(preCommitHook) {
    precommitHooks.push(preCommitHook);
  }
  var txFlowId;
  function getTransactionManager() {
    const commit = () => {
      if (!transaction || !transaction.inTransaction) {
        txLogger.warn(() => "No transaction in progress to commit.");
        return;
      }
      precommitHooks.forEach((hook) => {
        hook();
      });
      ;
      const txFlowIdToEnd = txFlowId;
      if (txFlowIdToEnd !== void 0) {
        roku.perfetto?.flowEvent(txFlowIdToEnd, "transaction.commit");
      }
      transactionApi?.end(txFlowIdToEnd);
      txFlowId = void 0;
      transaction = void 0;
    };
    const startTransaction = () => {
      if (!transaction) {
        txFlowId = Math.floor(Math.random() * 2147483647);
        roku.perfetto?.flowEvent(txFlowId, "transaction.start");
        ;
        transactionApi?.start();
        transactionStartHooks.forEach((hook) => {
          hook();
        });
        transaction = {
          inTransaction: true
        };
        Promise.resolve().then(commit);
      }
      return transaction;
    };
    return {
      startTransaction,
      inTransaction: () => {
        return transaction?.inTransaction;
      },
      commitEarly: () => {
        commit();
      }
    };
  }
  var transactionManager = getTransactionManager();

  // node_modules/.pnpm/solid-js@1.9.19/node_modules/solid-js/dist/solid.js
  var sharedConfig = {
    context: void 0,
    registry: void 0,
    effects: void 0,
    done: false,
    getContextId() {
      return getContextId(this.context.count);
    },
    getNextContextId() {
      return getContextId(this.context.count++);
    }
  };
  function getContextId(count2) {
    const num = String(count2), len = num.length - 1;
    return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
  }
  function setHydrateContext(context) {
    sharedConfig.context = context;
  }
  function nextHydrateContext() {
    return {
      ...sharedConfig.context,
      id: sharedConfig.getNextContextId(),
      count: 0
    };
  }
  var IS_DEV = false;
  var equalFn = (a, b) => a === b;
  var $PROXY = /* @__PURE__ */ Symbol("solid-proxy");
  var SUPPORTS_PROXY = typeof Proxy === "function";
  var signalOptions = {
    equals: equalFn
  };
  var ERROR = null;
  var runEffects = runQueue;
  var STALE = 1;
  var PENDING = 2;
  var UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  var Owner = null;
  var Transition = null;
  var Scheduler = null;
  var ExternalSourceConfig = null;
  var Listener = null;
  var Updates = null;
  var Effects = null;
  var ExecCount = 0;
  function createRoot(fn, detachedOwner) {
    const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    }, updateFn = unowned ? fn : () => fn(createDisposer(root));
    Owner = root;
    Listener = null;
    try {
      return runUpdates(updateFn, true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createDisposer(root) {
    return () => untrack(() => cleanNode(root));
  }
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        if (Transition && Transition.running && Transition.sources.has(s))
          value2 = value2(s.tValue);
        else
          value2 = value2(s.value);
      }
      return writeSignal(s, value2);
    };
    return [readSignal.bind(s), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c = createComputation(fn, value, false, STALE);
    if (Scheduler && Transition && Transition.running)
      Updates.push(c);
    else
      updateComputation(c);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c = createComputation(fn, value, true, 0);
    c.observers = null;
    c.observerSlots = null;
    c.comparator = options.equals || void 0;
    if (Scheduler && Transition && Transition.running) {
      c.tState = STALE;
      Updates.push(c);
    } else
      updateComputation(c);
    return readSignal.bind(c);
  }
  function untrack(fn) {
    if (!ExternalSourceConfig && Listener === null)
      return fn();
    const listener = Listener;
    Listener = null;
    try {
      if (ExternalSourceConfig)
        return ExternalSourceConfig.untrack(fn);
      return fn();
    } finally {
      Listener = listener;
    }
  }
  function onCleanup(fn) {
    if (Owner === null)
      ;
    else if (Owner.cleanups === null)
      Owner.cleanups = [fn];
    else
      Owner.cleanups.push(fn);
    return fn;
  }
  function catchError(fn, handler) {
    ERROR || (ERROR = /* @__PURE__ */ Symbol("error"));
    Owner = createComputation(void 0, void 0, true);
    Owner.context = {
      ...Owner.context,
      [ERROR]: [handler]
    };
    if (Transition && Transition.running)
      Transition.sources.add(Owner);
    try {
      return fn();
    } catch (err) {
      handleError(err);
    } finally {
      Owner = Owner.owner;
    }
  }
  function getOwner() {
    return Owner;
  }
  function startTransition(fn) {
    if (Transition && Transition.running) {
      fn();
      return Transition.done;
    }
    const l = Listener;
    const o = Owner;
    return Promise.resolve().then(() => {
      Listener = l;
      Owner = o;
      let t;
      if (Scheduler || SuspenseContext) {
        t = Transition || (Transition = {
          sources: /* @__PURE__ */ new Set(),
          effects: [],
          promises: /* @__PURE__ */ new Set(),
          disposed: /* @__PURE__ */ new Set(),
          queue: /* @__PURE__ */ new Set(),
          running: true
        });
        t.done || (t.done = new Promise((res) => t.resolve = res));
        t.running = true;
      }
      runUpdates(fn, false);
      Listener = Owner = null;
      return t ? t.done : void 0;
    });
  }
  var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
  var SuspenseContext;
  function repairObserverSlots(source) {
    source.observerSlots = source.observers.map((observer, slot) => {
      const sources = observer.sources;
      if (!sources)
        return -1;
      for (let i = sources.length - 1; i >= 0; i--) {
        if (sources[i] === source && observer.sourceSlots && observer.sourceSlots[i] === slot)
          return i;
      }
      return sources.lastIndexOf(source);
    });
  }
  function readSignal() {
    const runningTransition = Transition && Transition.running;
    if (this.sources && (runningTransition ? this.tState : this.state)) {
      if ((runningTransition ? this.tState : this.state) === STALE)
        updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const observers = this.observers;
      if (!observers || observers[observers.length - 1] !== Listener) {
        const sSlot = observers ? observers.length : 0;
        if (!Listener.sources) {
          const sources = [this];
          const sourceSlots = [sSlot];
          Listener.sources = sources;
          Listener.sourceSlots = sourceSlots;
        } else {
          Listener.sources.push(this);
          Listener.sourceSlots.push(sSlot);
        }
        if (!observers) {
          const newObservers = [Listener];
          const newObserverSlots = [Listener.sources.length - 1];
          this.observers = newObservers;
          this.observerSlots = newObserverSlots;
        } else {
          if (!this.observerSlots || this.observerSlots.length !== observers.length)
            repairObserverSlots(this);
          observers.push(Listener);
          this.observerSlots.push(Listener.sources.length - 1);
        }
      }
    }
    if (runningTransition && Transition.sources.has(this))
      return this.tValue;
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      if (Transition) {
        const TransitionRunning = Transition.running;
        if (TransitionRunning || !isComp && Transition.sources.has(node)) {
          Transition.sources.add(node);
          node.tValue = value;
        }
        if (!TransitionRunning)
          node.value = value;
      } else
        node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i = 0; i < node.observers.length; i += 1) {
            const o = node.observers[i];
            const TransitionRunning = Transition && Transition.running;
            if (TransitionRunning && Transition.disposed.has(o))
              continue;
            if (TransitionRunning ? !o.tState : !o.state) {
              if (o.pure)
                Updates.push(o);
              else
                Effects.push(o);
              if (o.observers)
                markDownstream(o);
            }
            if (!TransitionRunning)
              o.state = STALE;
            else
              o.tState = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (IS_DEV)
              ;
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn)
      return;
    cleanNode(node, true);
    const time2 = ExecCount;
    runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time2);
    if (Transition && !Transition.running && Transition.sources.has(node)) {
      queueMicrotask(() => {
        runUpdates(() => {
          Transition && (Transition.running = true);
          Listener = Owner = node;
          runComputation(node, node.tValue, time2);
          Listener = Owner = null;
        }, false);
      });
    }
  }
  function runComputation(node, value, time2) {
    let nextValue;
    const owner = Owner, listener = Listener;
    Listener = Owner = node;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure) {
        if (Transition && Transition.running) {
          node.tState = STALE;
          node.tOwned && node.tOwned.forEach((n) => cleanNode(n));
          node.tOwned = void 0;
        } else {
          node.state = STALE;
          node.owned && node.owned.forEach((n) => cleanNode(n));
          node.owned = null;
        }
      }
      node.updatedAt = time2 + 1;
      return handleError(err);
    } finally {
      Listener = listener;
      Owner = owner;
    }
    if (!node.updatedAt || node.updatedAt <= time2) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue, true);
      } else if (Transition && Transition.running && node.pure) {
        if (!Transition.sources.has(node))
          node.value = nextValue;
        Transition.sources.add(node);
        node.tValue = nextValue;
      } else
        node.value = nextValue;
      node.updatedAt = time2;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: Owner ? Owner.context : null,
      pure
    };
    if (Transition && Transition.running) {
      c.state = 0;
      c.tState = state;
    }
    if (Owner === null)
      ;
    else if (Owner !== UNOWNED) {
      if (Transition && Transition.running && Owner.pure) {
        if (!Owner.tOwned)
          Owner.tOwned = [c];
        else
          Owner.tOwned.push(c);
      } else {
        if (!Owner.owned)
          Owner.owned = [c];
        else
          Owner.owned.push(c);
      }
    }
    if (ExternalSourceConfig && c.fn) {
      const sourceFn = c.fn;
      const [track, trigger] = createSignal(void 0, {
        equals: false
      });
      const ordinary = ExternalSourceConfig.factory(sourceFn, trigger);
      onCleanup(() => ordinary.dispose());
      let inTransition;
      let trackedOrdinary = false;
      const triggerInTransition = () => startTransition(trigger).then(() => {
        if (inTransition) {
          inTransition.dispose();
          inTransition = void 0;
          if (!trackedOrdinary)
            trigger();
        }
      });
      c.fn = (x) => {
        track();
        if (Transition && Transition.running) {
          if (!inTransition)
            inTransition = ExternalSourceConfig.factory(sourceFn, triggerInTransition);
          return inTransition.track(x);
        }
        trackedOrdinary = true;
        return ordinary.track(x);
      };
    }
    return c;
  }
  function runTop(node) {
    const runningTransition = Transition && Transition.running;
    if ((runningTransition ? node.tState : node.state) === 0)
      return;
    if ((runningTransition ? node.tState : node.state) === PENDING)
      return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (runningTransition && Transition.disposed.has(node))
        return;
      if (runningTransition ? node.tState : node.state)
        ancestors.push(node);
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (runningTransition) {
        let top = node, prev = ancestors[i + 1];
        while ((top = top.owner) && top !== prev) {
          if (Transition.disposed.has(top))
            return;
        }
      }
      if ((runningTransition ? node.tState : node.state) === STALE) {
        updateComputation(node);
      } else if ((runningTransition ? node.tState : node.state) === PENDING) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates)
      return fn();
    let wait = false;
    if (!init)
      Updates = [];
    if (Effects)
      wait = true;
    else
      Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait);
      return res;
    } catch (err) {
      if (!wait)
        Effects = null;
      Updates = null;
      handleError(err);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      if (Scheduler && Transition && Transition.running)
        scheduleQueue(Updates);
      else
        runQueue(Updates);
      Updates = null;
    }
    if (wait)
      return;
    let res;
    if (Transition) {
      if (!Transition.promises.size && !Transition.queue.size) {
        const sources = Transition.sources;
        const disposed = Transition.disposed;
        Effects.push.apply(Effects, Transition.effects);
        res = Transition.resolve;
        for (const e2 of Effects) {
          "tState" in e2 && (e2.state = e2.tState);
          delete e2.tState;
        }
        Transition = null;
        runUpdates(() => {
          for (const d of disposed)
            cleanNode(d);
          for (const v of sources) {
            v.value = v.tValue;
            if (v.owned) {
              for (let i = 0, len = v.owned.length; i < len; i++)
                cleanNode(v.owned[i]);
            }
            if (v.tOwned)
              v.owned = v.tOwned;
            delete v.tValue;
            delete v.tOwned;
            v.tState = 0;
          }
          setTransPending(false);
        }, false);
      } else if (Transition.running) {
        Transition.running = false;
        Transition.effects.push.apply(Transition.effects, Effects);
        Effects = null;
        setTransPending(true);
        return;
      }
    }
    const e = Effects;
    Effects = null;
    if (e.length)
      runUpdates(() => runEffects(e), false);
    if (res)
      res();
  }
  function runQueue(queue) {
    for (let i = 0; i < queue.length; i++)
      runTop(queue[i]);
  }
  function scheduleQueue(queue) {
    const _loop_1 = (i) => {
      const item = queue[i];
      const tasks = Transition.queue;
      if (!tasks.has(item)) {
        tasks.add(item);
        Scheduler(() => {
          tasks.delete(item);
          runUpdates(() => {
            Transition.running = true;
            runTop(item);
          }, false);
          Transition && (Transition.running = false);
        });
      }
    };
    for (let i = 0; i < queue.length; i++) {
      _loop_1(i);
    }
  }
  function lookUpstream(node, ignore) {
    const runningTransition = Transition && Transition.running;
    if (runningTransition)
      node.tState = 0;
    else
      node.state = 0;
    for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
        const state = runningTransition ? source.tState : source.state;
        if (state === STALE) {
          if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
            runTop(source);
        } else if (state === PENDING)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    const runningTransition = Transition && Transition.running;
    for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (runningTransition ? !o.tState : !o.state) {
        if (runningTransition)
          o.tState = PENDING;
        else
          o.state = PENDING;
        if (o.pure)
          Updates.push(o);
        else
          Effects.push(o);
        o.observers && markDownstream(o);
      }
    }
  }
  function releaseTransitionSource(node) {
    if (Transition && Transition.sources.has(node)) {
      Transition.sources.delete(node);
      delete node.tValue;
    }
  }
  function cleanNode(node, recompute) {
    let i;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          if (!source.observerSlots || source.observerSlots.length !== obs.length)
            repairObserverSlots(source);
          const n = obs.pop(), s = source.observerSlots.pop();
          if (index < obs.length) {
            n.sourceSlots[s] = index;
            obs[index] = n;
            source.observerSlots[index] = s;
          }
        }
        if (!recompute && (!obs || !obs.length) && Transition)
          releaseTransitionSource(source);
      }
    }
    if (node.tOwned) {
      for (i = node.tOwned.length - 1; i >= 0; i--)
        cleanNode(node.tOwned[i]);
      delete node.tOwned;
    }
    if (Transition && Transition.running && node.pure) {
      reset(node, true);
    } else if (node.owned) {
      for (i = node.owned.length - 1; i >= 0; i--)
        cleanNode(node.owned[i]);
      node.owned = null;
    }
    if (!recompute)
      releaseTransitionSource(node);
    if (node.cleanups) {
      for (i = node.cleanups.length - 1; i >= 0; i--)
        node.cleanups[i]();
      node.cleanups = null;
    }
    if (Transition && Transition.running)
      node.tState = 0;
    else
      node.state = 0;
  }
  function reset(node, top) {
    if (!top) {
      node.tState = 0;
      Transition.disposed.add(node);
      releaseTransitionSource(node);
    }
    if (node.owned) {
      for (let i = 0; i < node.owned.length; i++)
        reset(node.owned[i]);
    }
  }
  function castError(err) {
    if (err instanceof Error)
      return err;
    return new Error(typeof err === "string" ? err : "Unknown error", {
      cause: err
    });
  }
  function runErrors(err, fns, owner) {
    try {
      for (const f of fns)
        f(err);
    } catch (e) {
      handleError(e, owner && owner.owner || null);
    }
  }
  function handleError(err, owner = Owner) {
    const fns = ERROR && owner && owner.context && owner.context[ERROR];
    const error = castError(err);
    if (!fns)
      throw error;
    if (Effects)
      Effects.push({
        fn() {
          runErrors(error, fns, owner);
        },
        state: STALE
      });
    else
      runErrors(error, fns, owner);
  }
  var hydrationEnabled = false;
  function createComponent(Comp, props) {
    if (hydrationEnabled) {
      if (sharedConfig.context) {
        const c = sharedConfig.context;
        setHydrateContext(nextHydrateContext());
        const r = untrack(() => Comp(props || {}));
        setHydrateContext(c);
        return r;
      }
    }
    return untrack(() => Comp(props || {}));
  }
  function trueFn() {
    return true;
  }
  var propTraps = {
    get(_, property, receiver) {
      if (property === $PROXY)
        return receiver;
      return _.get(property);
    },
    has(_, property) {
      if (property === $PROXY)
        return true;
      return _.has(property);
    },
    set: trueFn,
    deleteProperty: trueFn,
    getOwnPropertyDescriptor(_, property) {
      return {
        configurable: true,
        enumerable: true,
        get() {
          return _.get(property);
        },
        set: trueFn,
        deleteProperty: trueFn
      };
    },
    ownKeys(_) {
      return _.keys();
    }
  };
  function resolveSource(s) {
    return !(s = typeof s === "function" ? s() : s) ? {} : s;
  }
  function resolveSources() {
    for (let i = 0, length = this.length; i < length; ++i) {
      const v = this[i]();
      if (v !== void 0)
        return v;
    }
  }
  function mergeProps(...sources) {
    let proxy = false;
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      proxy = proxy || !!s && $PROXY in s;
      sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
    }
    if (SUPPORTS_PROXY && proxy) {
      return new Proxy({
        get(property) {
          for (let i = sources.length - 1; i >= 0; i--) {
            const v = resolveSource(sources[i])[property];
            if (v !== void 0)
              return v;
          }
        },
        has(property) {
          for (let i = sources.length - 1; i >= 0; i--) {
            if (property in resolveSource(sources[i]))
              return true;
          }
          return false;
        },
        keys() {
          const keys = [];
          for (let i = 0; i < sources.length; i++)
            keys.push(...Object.keys(resolveSource(sources[i])));
          return [...new Set(keys)];
        }
      }, propTraps);
    }
    const sourcesMap = {};
    const defined = /* @__PURE__ */ Object.create(null);
    const _loop_2 = (i) => {
      const source = sources[i];
      if (!source)
        return { type: "continue", mutations: { i } };
      const sourceKeys = Object.getOwnPropertyNames(source);
      const _loop_1 = (_i) => {
        const key = sourceKeys[_i];
        if (key === "__proto__" || key === "constructor")
          return "continue";
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (!defined[key]) {
          defined[key] = desc.get ? {
            enumerable: true,
            configurable: true,
            get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
          } : desc.value !== void 0 ? desc : void 0;
        } else {
          const sources2 = sourcesMap[key];
          if (sources2) {
            if (desc.get)
              sources2.push(desc.get.bind(source));
            else if (desc.value !== void 0)
              sources2.push(() => desc.value);
          }
        }
      };
      for (let i2 = sourceKeys.length - 1; i2 >= 0; i2--) {
        _loop_1(i2);
      }
      return { mutations: { i } };
    };
    for (let i = sources.length - 1; i >= 0; i--) {
      const _loopResult_1 = _loop_2(i);
      if (typeof _loopResult_1 === "object" && _loopResult_1.type === "continue") {
        i = _loopResult_1.mutations.i;
      }
      if (typeof _loopResult_1 === "object" && _loopResult_1.mutations) {
        i = _loopResult_1.mutations.i;
      }
    }
    const target = {};
    const definedKeys = Object.keys(defined);
    for (let i = definedKeys.length - 1; i >= 0; i--) {
      const key = definedKeys[i], desc = defined[key];
      if (desc && desc.get)
        Object.defineProperty(target, key, desc);
      else
        target[key] = desc ? desc.value : void 0;
    }
    return target;
  }
  var Errors;
  function ErrorBoundary(props) {
    let err;
    if (sharedConfig.context && sharedConfig.load)
      err = sharedConfig.load(sharedConfig.getContextId());
    const [errored, setErrored] = createSignal(err, void 0);
    Errors || (Errors = /* @__PURE__ */ new Set());
    Errors.add(setErrored);
    onCleanup(() => Errors.delete(setErrored));
    return createMemo(() => {
      let e;
      if (e = errored()) {
        const f = props.fallback;
        return typeof f === "function" && f.length ? untrack(() => f(e, () => setErrored())) : f;
      }
      return catchError(() => props.children, setErrored);
    }, void 0, void 0);
  }
  var DEV = void 0;

  // node_modules/.pnpm/solid-js@1.9.19/node_modules/solid-js/universal/dist/universal.js
  var memo = (fn) => createMemo(() => fn());
  function createRenderer$1({ createElement: createElement2, createTextNode: createTextNode2, isTextNode, replaceText, insertNode: insertNode2, removeNode, setProperty, getParentNode, getFirstChild, getNextSibling }) {
    function insert2(parent, accessor, marker, initial) {
      if (marker !== void 0 && !initial)
        initial = [];
      if (typeof accessor !== "function")
        return insertExpression(parent, accessor, initial, marker);
      createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
    }
    function insertExpression(parent, value, current, marker, unwrapArray) {
      while (typeof current === "function")
        current = current();
      if (value === current)
        return current;
      const t = typeof value, multi = marker !== void 0;
      if (t === "string" || t === "number") {
        if (t === "number")
          value = value.toString();
        if (multi) {
          let node = current[0];
          if (node && isTextNode(node)) {
            replaceText(node, value);
          } else
            node = createTextNode2(value);
          current = cleanChildren(parent, current, marker, node);
        } else {
          if (current !== "" && typeof current === "string") {
            replaceText(getFirstChild(parent), current = value);
          } else {
            cleanChildren(parent, current, marker, createTextNode2(value));
            current = value;
          }
        }
      } else if (value == null || t === "boolean") {
        current = cleanChildren(parent, current, marker);
      } else if (t === "function") {
        createRenderEffect(() => {
          let v = value();
          while (typeof v === "function")
            v = v();
          current = insertExpression(parent, v, current, marker);
        });
        return () => current;
      } else if (Array.isArray(value)) {
        const array = [];
        if (normalizeIncomingArray(array, value, unwrapArray)) {
          createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
          return () => current;
        }
        if (array.length === 0) {
          const replacement = cleanChildren(parent, current, marker);
          if (multi)
            return current = replacement;
        } else {
          if (Array.isArray(current)) {
            if (current.length === 0) {
              appendNodes(parent, array, marker);
            } else
              reconcileArrays(parent, current, array);
          } else if (current == null || !getFirstChild(parent)) {
            appendNodes(parent, array);
          } else {
            reconcileArrays(parent, multi && current || [getFirstChild(parent)], array);
          }
        }
        current = array;
      } else {
        if (Array.isArray(current)) {
          if (multi)
            return current = cleanChildren(parent, current, marker, value);
          cleanChildren(parent, current, null, value);
        } else if (current == null || !getFirstChild(parent)) {
          insertNode2(parent, value);
        } else
          replaceNode(parent, value, getFirstChild(parent));
        current = value;
      }
      return current;
    }
    function normalizeIncomingArray(normalized, array, unwrap) {
      let dynamic = false;
      for (let i = 0, len = array.length; i < len; i++) {
        let item = array[i], t;
        if (item == null || item === true || item === false)
          ;
        else if (Array.isArray(item)) {
          dynamic = normalizeIncomingArray(normalized, item) || dynamic;
        } else if ((t = typeof item) === "string" || t === "number") {
          normalized.push(createTextNode2(item));
        } else if (t === "function") {
          if (unwrap) {
            while (typeof item === "function")
              item = item();
            dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
          } else {
            normalized.push(item);
            dynamic = true;
          }
        } else
          normalized.push(item);
      }
      return dynamic;
    }
    function reconcileArrays(parentNode, a, b) {
      let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = getNextSibling(a[aEnd - 1]), map = null;
      while (aStart < aEnd || bStart < bEnd) {
        if (a[aStart] === b[bStart]) {
          aStart++;
          bStart++;
          continue;
        }
        while (a[aEnd - 1] === b[bEnd - 1]) {
          aEnd--;
          bEnd--;
        }
        if (aEnd === aStart) {
          const node = bEnd < bLength ? bStart ? getNextSibling(b[bStart - 1]) : b[bEnd - bStart] : after;
          while (bStart < bEnd)
            insertNode2(parentNode, b[bStart++], node);
        } else if (bEnd === bStart) {
          while (aStart < aEnd) {
            if (!map || !map.has(a[aStart]))
              removeNode(parentNode, a[aStart]);
            aStart++;
          }
        } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
          const node = getNextSibling(a[--aEnd]);
          insertNode2(parentNode, b[bStart++], getNextSibling(a[aStart++]));
          insertNode2(parentNode, b[--bEnd], node);
          a[aEnd] = b[bEnd];
        } else {
          if (!map) {
            map = /* @__PURE__ */ new Map();
            let i = bStart;
            while (i < bEnd)
              map.set(b[i], i++);
          }
          const index = map.get(a[aStart]);
          if (index != null) {
            if (bStart < index && index < bEnd) {
              let i = aStart, sequence = 1, t;
              while (++i < aEnd && i < bEnd) {
                if ((t = map.get(a[i])) == null || t !== index + sequence)
                  break;
                sequence++;
              }
              if (sequence > index - bStart) {
                const node = a[aStart];
                while (bStart < index)
                  insertNode2(parentNode, b[bStart++], node);
              } else
                replaceNode(parentNode, b[bStart++], a[aStart++]);
            } else
              aStart++;
          } else
            removeNode(parentNode, a[aStart++]);
        }
      }
    }
    function cleanChildren(parent, current, marker, replacement) {
      if (marker === void 0) {
        let removed;
        while (removed = getFirstChild(parent))
          removeNode(parent, removed);
        replacement && insertNode2(parent, replacement);
        return "";
      }
      const node = replacement || createTextNode2("");
      if (current.length) {
        let inserted = false;
        for (let i = current.length - 1; i >= 0; i--) {
          const el = current[i];
          if (node !== el) {
            const isParent = getParentNode(el) === parent;
            if (!inserted && !i)
              isParent ? replaceNode(parent, node, el) : insertNode2(parent, node, marker);
            else
              isParent && removeNode(parent, el);
          } else
            inserted = true;
        }
      } else
        insertNode2(parent, node, marker);
      return [node];
    }
    function appendNodes(parent, array, marker) {
      for (let i = 0, len = array.length; i < len; i++)
        insertNode2(parent, array[i], marker);
    }
    function replaceNode(parent, newNode, oldNode) {
      insertNode2(parent, newNode, oldNode);
      removeNode(parent, oldNode);
    }
    function spreadExpression(node, props, prevProps = {}, skipChildren) {
      props || (props = {});
      if (!skipChildren) {
        createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
      }
      createRenderEffect(() => props.ref && props.ref(node));
      createRenderEffect(() => {
        const propNames = /* @__PURE__ */ new Set();
        for (const prop in props)
          propNames.add(prop);
        for (const prop in prevProps) {
          if (prop === "children" || prop === "ref" || propNames.has(prop))
            continue;
          setProperty(node, prop, void 0, prevProps[prop]);
          delete prevProps[prop];
        }
        for (const prop of propNames) {
          if (prop === "children" || prop === "ref")
            continue;
          const value = props[prop];
          if (value === prevProps[prop])
            continue;
          setProperty(node, prop, value, prevProps[prop]);
          prevProps[prop] = value;
        }
      });
      return prevProps;
    }
    return {
      render(code, element) {
        let disposer;
        createRoot((dispose) => {
          disposer = dispose;
          insert2(element, code());
        });
        return disposer;
      },
      insert: insert2,
      spread(node, accessor, skipChildren) {
        if (typeof accessor === "function") {
          createRenderEffect((current) => spreadExpression(node, accessor(), current, skipChildren));
        } else
          spreadExpression(node, accessor, void 0, skipChildren);
      },
      createElement: createElement2,
      createTextNode: createTextNode2,
      insertNode: insertNode2,
      setProp(node, name, value, prev) {
        setProperty(node, name, value, prev);
        return value;
      },
      mergeProps,
      effect: createRenderEffect,
      memo,
      createComponent,
      use(fn, element, arg) {
        return untrack(() => fn(element, arg));
      }
    };
  }
  function createRenderer(options) {
    const renderer = createRenderer$1(options);
    renderer.mergeProps = mergeProps;
    return renderer;
  }

  // node_modules/.pnpm/@roku-sdk+solid@2.19.1/node_modules/@roku-sdk/solid/src/dom-node.ts
  var defaultProto = {
    _s: domNodeSymbol
  };
  var tagProtoMap = /* @__PURE__ */ new Map();
  var imperativeMethodsRegistry = /* @__PURE__ */ new Map();
  var focusHandler;
  var blurHandler;
  var setPropertyHandler;
  function addImperativeMethods(tag, proto) {
    const methods = imperativeMethodsRegistry.get(tag);
    if (methods) {
      Object.defineProperties(proto, methods);
    }
  }
  function createDomNode(tag, nodeRef) {
    if (!tagProtoMap.has(tag)) {
      const objByTag = Object.create(defaultProto, {
        t: {
          // Not storing interned string ref since this object is never sent to other domain.
          // Hermes does intern all string literals.
          // Do use tagRef if we use js engine that does not support string interning.
          value: tag,
          writable: false,
          enumerable: true,
          configurable: false
        },
        focus: {
          value: function() {
            focusHandler?.(this);
          },
          writable: false,
          enumerable: false,
          configurable: false
        },
        blur: {
          value: function() {
            blurHandler?.(this);
          },
          writable: false,
          enumerable: false,
          configurable: false
        }
      });
      addImperativeMethods(tag, objByTag);
      tagProtoMap.set(tag, objByTag);
    }
    const node = Object.create(tagProtoMap.get(tag), {
      r: {
        value: nodeRef,
        writable: false,
        enumerable: true,
        configurable: false
      },
      parent: {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: false
      }
    });
    return node;
  }
  function isDomNode(node) {
    return node?._s === domNodeSymbol;
  }
  function setFocusHandler(handler) {
    focusHandler = handler;
  }
  function setBlurHandler(handler) {
    blurHandler = handler;
  }
  function setSetPropertyHandler(handler) {
    setPropertyHandler = handler;
  }

  // node_modules/.pnpm/@roku-sdk+solid@2.19.1/node_modules/@roku-sdk/solid/src/focus.ts
  var tmApi;
  var focusLogger;
  var NO_ANCHOR;
  var focused;
  var pending;
  var requestCount = 0;
  var restoreAnchor;
  function findOwningAnchor(node) {
    let current = node;
    while (current?.parent) {
      current = current.parent;
    }
    return current && current.t === void 0 ? current : void 0;
  }
  function initFocus(api, log, noAnchor) {
    tmApi = api;
    focusLogger = log;
    NO_ANCHOR = noAnchor;
  }
  function requestFocus(node) {
    pending = node;
    requestCount++;
  }
  function releaseFocus(node) {
    if (pending === node) {
      pending = void 0;
      requestCount = Math.max(0, requestCount - 1);
    }
    tmApi.setFocus(NO_ANCHOR, node.r, false);
    if (focused === node) {
      restoreAnchor = findOwningAnchor(node);
      focused = void 0;
    }
  }
  function focusNodeRemoved(node, attachParent) {
    if (node === focused) {
      restoreAnchor = findOwningAnchor(attachParent);
      focused = void 0;
    }
    if (node === pending) {
      pending = void 0;
      requestCount = Math.max(0, requestCount - 1);
    }
  }
  function forgetAnchor(anchor) {
    if (restoreAnchor === anchor) {
      restoreAnchor = void 0;
    }
    if (focused && findOwningAnchor(focused) === anchor) {
      focused = void 0;
    }
    if (pending && findOwningAnchor(pending) === anchor) {
      pending = void 0;
      requestCount = Math.max(0, requestCount - 1);
    }
  }
  function commitFocus() {
    if (requestCount > 1) {
      const count2 = requestCount;
      focusLogger.warn(() => `Multiple nodes (${count2}) requested focus in one transaction. Only last one will receive focus.`);
    }
    const node = pending;
    const anchor = restoreAnchor;
    pending = void 0;
    restoreAnchor = void 0;
    requestCount = 0;
    if (node) {
      tmApi.setFocus(NO_ANCHOR, node.r, true);
      focused = node;
      focusLogger.trace(() => `setFocus: ${node.t}`);
    } else if (anchor?.canReceiveFocus) {
      tmApi.setFocus(NO_ANCHOR, anchor.r, true);
      focusLogger.trace(() => `setFocus re-anchored to anchor node`);
    }
  }

  // node_modules/.pnpm/@roku-sdk+solid@2.19.1/node_modules/@roku-sdk/solid/src/solid.ts
  var solidLogger = logger.getLogger("fwk");
  var setPropertyObservers = [];
  var notifySetPropertyObservers = (node, name, value) => {
    if (setPropertyObservers.length === 0)
      return;
    for (const observer of setPropertyObservers) {
      try {
        observer(node, name, value);
      } catch (error) {
        console.error("[solid] setProperty observer threw:", error);
      }
    }
  };
  var tmApi2;
  var createFullArray;
  var createFullObject;
  var sdCommit;
  var observerCallbacks = /* @__PURE__ */ new WeakMap();
  var NO_ANCHOR2 = Object.freeze({});
  var nodesToRemove = /* @__PURE__ */ new Set();
  var pendingAppendParents = /* @__PURE__ */ new Set();
  var pendingAppendChildren = /* @__PURE__ */ new Set();
  var appendsPending = false;
  function nextNativeSibling(children2, start) {
    for (let i = start; i < children2.length; i++) {
      const child = children2[i];
      if (child && !pendingAppendChildren.has(child)) {
        return child;
      }
    }
    return void 0;
  }
  function warnUnorderedAppendOnlyInsert(parent, node, anchor) {
    solidLogger.warn(() => `${parent.t} only appends children: ${node.t} placed before ${anchor.t} may not keep that position in SceneGraph`);
  }
  function insertIntoAppendOnlyParent(parent, node, anchor) {
    const children2 = parent.c = parent.c || [];
    const nodeIdx = children2.indexOf(node);
    if (nodeIdx !== -1) {
      children2.splice(nodeIdx, 1);
    }
    node.parent = parent;
    let anchorIdx = anchor ? children2.indexOf(anchor) : -1;
    if (anchorIdx === -1) {
      anchorIdx = children2.length;
    }
    children2.splice(anchorIdx, 0, node);
    if (nodeIdx === -1 || appendsPending && pendingAppendChildren.has(node)) {
      appendsPending = true;
      pendingAppendChildren.add(node);
      pendingAppendParents.add(parent);
      ;
      return;
    }
    const next = nextNativeSibling(children2, anchorIdx + 1);
    if (next) {
      warnUnorderedAppendOnlyInsert(parent, node, next);
      tmApi2.insertNodeBefore(NO_ANCHOR2, parent.r, node.r, next.r);
    } else {
      tmApi2.appendNode(NO_ANCHOR2, parent.r, node.r);
    }
    ;
  }
  function resetPendingAppends() {
    pendingAppendParents.clear();
    pendingAppendChildren.clear();
    appendsPending = false;
  }
  function flushPendingAppends() {
    pendingAppendParents.forEach((parent) => {
      const children2 = parent.c ?? [];
      for (let i = 0; i < children2.length; i++) {
        const child = children2[i];
        if (!child || child.parent !== parent || !pendingAppendChildren.delete(child)) {
          continue;
        }
        const next = nextNativeSibling(children2, i + 1);
        if (next) {
          warnUnorderedAppendOnlyInsert(parent, child, next);
          tmApi2.insertNodeBefore(NO_ANCHOR2, parent.r, child.r, next.r);
        } else {
          tmApi2.appendNode(NO_ANCHOR2, parent.r, child.r);
        }
      }
    });
    resetPendingAppends();
  }
  function getParent(node) {
    return node.parent;
  }
  var removeNodeRecursively = (node) => {
    const attachParent = node.parent;
    const stack = [node];
    while (stack.length > 0) {
      const currentNode = stack.pop();
      if (!currentNode) {
        continue;
      }
      if (currentNode.c) {
        stack.push(...currentNode.c);
      }
      focusNodeRemoved(currentNode, attachParent);
      if (currentNode.r) {
        observerCallbacks.delete(currentNode.r);
        currentNode.parent = void 0;
      }
    }
  };
  var isEventHandlerCache = /* @__PURE__ */ new Map();
  var eventNameTransformCache = /* @__PURE__ */ new Map();
  function isEventHandler(key) {
    let result = isEventHandlerCache.get(key);
    if (result === void 0) {
      result = key.length > 2 && key.charAt(0) === "o" && key.charAt(1) === "n" && key.charAt(2) >= "A" && key.charAt(2) <= "Z";
      isEventHandlerCache.set(key, result);
    }
    return result;
  }
  function transformEventName(eventName) {
    let transformed = eventNameTransformCache.get(eventName);
    if (transformed === void 0) {
      transformed = eventName.slice(2).charAt(0).toLowerCase() + eventName.slice(3);
      eventNameTransformCache.set(eventName, transformed);
    }
    return transformed;
  }
  var tagAliases = /* @__PURE__ */ new Map();
  var registerTagAlias = (tag, resolve) => {
    tagAliases.set(tag, resolve);
  };
  var tmTransaction = {
    createElement: (tag) => {
      const sgType = tagAliases.size === 0 ? tag : tagAliases.get(tag)?.() ?? tag;
      const tagRef = stringInterner.internString(sgType);
      if (tagRef === void 0) {
        throw new Error(`Tag not interned: ${sgType}`);
      }
      const nodeRef = tmApi2.createNode(NO_ANCHOR2, tagRef);
      const element = createDomNode(sgType, nodeRef);
      ;
      return element;
    },
    setProperty: (node, name, value, prev) => {
      const nodeRef = node.r;
      let eventProp = false;
      if (isEventHandler(name)) {
        name = transformEventName(name);
        eventProp = true;
      }
      const propRef = stringInterner.internString(name);
      if (propRef === void 0) {
        throw new Error(`Property not interned: ${name}`);
      }
      ;
      if (eventProp) {
        if (typeof prev === "function") {
          tmApi2.unregisterFieldHandler(NO_ANCHOR2, node.r, propRef);
        }
        if (typeof value === "function") {
          tmApi2.registerFieldChangeHandler(NO_ANCHOR2, node.r, propRef);
        }
        let callbacks = observerCallbacks.get(nodeRef);
        if (!callbacks) {
          callbacks = /* @__PURE__ */ new WeakMap();
          observerCallbacks.set(nodeRef, callbacks);
        }
        callbacks.set(propRef, value);
        notifySetPropertyObservers(node, name, value);
        return;
      } else {
        switch (typeof value) {
          case "boolean":
            if (name === "gainFocus") {
              if (value) {
                requestFocus(node);
              } else {
                releaseFocus(node);
              }
              break;
            }
            tmApi2.setNodePropBool(NO_ANCHOR2, nodeRef, propRef, value);
            break;
          case "number":
            if (Number.isInteger(value)) {
              tmApi2.setNodePropInt(NO_ANCHOR2, nodeRef, propRef, value);
            } else {
              tmApi2.setNodePropFloat(NO_ANCHOR2, nodeRef, propRef, value);
            }
            break;
          case "string":
            tmApi2.setNodePropString(NO_ANCHOR2, nodeRef, propRef, value);
            break;
          case "object":
            if (value === null) {
              tmApi2.setNodePropNull(NO_ANCHOR2, nodeRef, propRef);
            } else if (Array.isArray(value)) {
              const arrayRef = createFullArray(value);
              tmApi2.setNodePropArray(NO_ANCHOR2, nodeRef, propRef, arrayRef);
            } else if (isDomNode(value)) {
              tmApi2.setNodePropNodeRef(NO_ANCHOR2, nodeRef, propRef, value.r);
            } else {
              const objectRef = createFullObject(value);
              tmApi2.setNodePropObject(NO_ANCHOR2, nodeRef, propRef, objectRef);
            }
            break;
        }
      }
      if (typeof prev === "object" && isDomNode(prev)) {
        nodesToRemove.add(prev);
      }
      notifySetPropertyObservers(node, name, value);
    },
    insertNode: (parent, node, anchor) => {
      if (node === anchor) {
        return;
      }
      if (parent.t === "panelSet") {
        insertIntoAppendOnlyParent(parent, node, anchor);
        nodesToRemove.delete(node);
        return;
      }
      if (parent.c) {
        const nodeIdx = parent.c.indexOf(node);
        if (nodeIdx !== -1) {
          parent.c.splice(nodeIdx, 1);
        }
      }
      node.parent = parent;
      if (anchor && parent.c) {
        const anchorIdx = parent.c.indexOf(anchor);
        if (anchorIdx !== -1) {
          parent.c.splice(anchorIdx, 0, node);
        }
        tmApi2.insertNodeBefore(NO_ANCHOR2, parent.r, node.r, anchor.r);
        ;
      } else {
        parent.c = parent.c || [];
        parent.c.push(node);
        tmApi2.appendNode(NO_ANCHOR2, parent.r, node.r);
        ;
      }
      if (nodesToRemove.has(node)) {
        nodesToRemove.delete(node);
      }
    },
    removeNode: (parent, child) => {
      if (parent.c) {
        const childIdx = parent.c.indexOf(child);
        if (childIdx !== -1) {
          parent.c.splice(childIdx, 1);
        }
      }
      nodesToRemove.add(child);
    },
    // Note: Precomit is used to remove nodes & set focus.
    // Node removal is done later as solid.js can remove & attach nodes in the same transaction.
    // Focus is set at the end of the transaction as focus changes are lost of setFocus is called in middle of the transaction.
    preCommit: () => {
      nodesToRemove.forEach((node) => {
        const parent = getParent(node);
        if (parent && !(appendsPending && parent.t === "panelSet" && pendingAppendChildren.has(node))) {
          tmApi2.removeNode(NO_ANCHOR2, parent.r, node.r);
          ;
        }
        removeNodeRecursively(node);
      });
      if (appendsPending) {
        flushPendingAppends();
      }
      commitFocus();
      nodesToRemove.clear();
      sdCommit();
    }
  };
  registerPreCommitHook(tmTransaction.preCommit);
  setSetPropertyHandler((node, name, value) => {
    transactionManager.startTransaction();
    tmTransaction.setProperty(node, name, value);
  });
  setFocusHandler((focusNode) => {
    transactionManager.startTransaction();
    requestFocus(focusNode);
  });
  setBlurHandler((blurNode) => {
    transactionManager.startTransaction();
    releaseFocus(blurNode);
    ;
  });
  function createSolidRenderer() {
    return createRenderer({
      createElement(tag) {
        transactionManager.startTransaction();
        return tmTransaction.createElement(tag);
      },
      createTextNode(value) {
        if (value !== "") {
          solidLogger.warn(() => `Text content "${value}" is not rendered on Roku SceneGraph. Use <label> for text display.`);
        }
        transactionManager.startTransaction();
        return tmTransaction.createElement("group");
      },
      replaceText(textNode, value) {
        ;
        return;
      },
      isTextNode(node) {
        ;
        return false;
      },
      setProperty(node, name, value, prev) {
        transactionManager.startTransaction();
        tmTransaction.setProperty(node, name, value, prev);
      },
      insertNode(parent, node, anchor) {
        transactionManager.startTransaction();
        tmTransaction.insertNode(parent, node, anchor);
      },
      removeNode(parent, child) {
        transactionManager.startTransaction();
        tmTransaction.removeNode(parent, child);
      },
      getParentNode(node) {
        return getParent(node);
      },
      getFirstChild(node) {
        return node?.c?.[0] ?? void 0;
      },
      getNextSibling(node) {
        const parent = getParent(node);
        if (parent && parent.c) {
          return parent.c[parent.c.indexOf(node) + 1] ?? void 0;
        }
        return void 0;
      }
    });
  }
  function destroySolidRenderer() {
  }
  function makeRendererFactory(type, api, incomingSDApi, outgoingSDApi) {
    tmApi2 = api;
    initFocus(api, solidLogger, NO_ANCHOR2);
    ({
      createFullArray,
      createFullObject,
      commit: sdCommit
    } = createSDHelper(outgoingSDApi));
    const fieldChangeHandler = /* @__PURE__ */ (() => {
      const invokeCallback = (_anRef, nodeRef, fieldRef, value) => {
        const callbacks = observerCallbacks.get(nodeRef);
        if (callbacks) {
          const callback = callbacks.get(fieldRef);
          if (callback && typeof callback === "function") {
            callback(value);
          }
        }
      };
      return {
        onNodeNullFieldChange: (anRef, nodeRef, fieldRef) => {
          invokeCallback(anRef, nodeRef, fieldRef, null);
        },
        onNodeBoolFieldChange: (anRef, nodeRef, fieldRef, value) => {
          invokeCallback(anRef, nodeRef, fieldRef, value);
        },
        onNodeIntFieldChange: (anRef, nodeRef, fieldRef, value) => {
          invokeCallback(anRef, nodeRef, fieldRef, value);
        },
        onNodeFloatFieldChange: (anRef, nodeRef, fieldRef, value) => {
          invokeCallback(anRef, nodeRef, fieldRef, value);
        },
        onNodeStringFieldChange: (anRef, nodeRef, fieldRef, value) => {
          invokeCallback(anRef, nodeRef, fieldRef, value);
        },
        onNodeObjectFieldChange: (anRef, nodeRef, fieldRef, valueRef) => {
          const data = incomingSDApi.getObject(valueRef);
          if (!data) {
            solidLogger.error(() => `Failed to get object from ref`);
            return;
          }
          invokeCallback(anRef, nodeRef, fieldRef, data);
        },
        onNodeArrayFieldChange: (anRef, nodeRef, fieldRef, valueRef) => {
          const data = incomingSDApi.getArray(valueRef);
          if (!data) {
            solidLogger.error(() => `Failed to get array from ref`);
            return;
          }
          invokeCallback(anRef, nodeRef, fieldRef, data);
        }
      };
    })();
    return {
      createRenderer: createSolidRenderer,
      destroyRenderer: destroySolidRenderer,
      tmFieldChangeHandlerApi: fieldChangeHandler
    };
  }
  function throwUninitializedRendererHook(hookName) {
    throw new Error(`@roku-sdk/solid internal hook "${hookName}" was called before renderer initialization. Ensure makeSolidRenderer() runs via @roku-sdk/rsg-ts setUp() before rendering JSX.`);
  }
  function uninitializedHook(name) {
    return () => throwUninitializedRendererHook(name);
  }
  var effect;
  var memo2;
  var createComponent2;
  var createElement;
  var createTextNode;
  var insertNode;
  var insert;
  var spread;
  var setProp;
  var use;
  effect = uninitializedHook("effect");
  memo2 = uninitializedHook("memo");
  createComponent2 = uninitializedHook("createComponent");
  createElement = uninitializedHook("createElement");
  createTextNode = uninitializedHook("createTextNode");
  insertNode = uninitializedHook("insertNode");
  insert = uninitializedHook("insert");
  spread = uninitializedHook("spread");
  setProp = uninitializedHook("setProp");
  use = uninitializedHook("use");
  function makeSolidRenderer(api, incomingSDApi, outgoingSDApi) {
    const { createRenderer: createRenderer2, destroyRenderer, tmFieldChangeHandlerApi } = makeRendererFactory("solid", api, incomingSDApi, outgoingSDApi);
    const renderer = createRenderer2();
    ({
      effect,
      memo: memo2,
      createComponent: createComponent2,
      createElement,
      createTextNode,
      insertNode,
      insert,
      spread,
      setProp,
      use
    } = renderer);
    const originalSpread = spread;
    spread = (node, accessor, skipChildren) => {
      const createReorderedProxy = (propsObj) => {
        const keys = Object.keys(propsObj);
        if (keys.length <= 1) {
          return propsObj;
        }
        const eventHandlers = [];
        const regularProps = [];
        let needsReorder = false;
        let seenRegularProp = false;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key === void 0) {
            continue;
          }
          if (isEventHandler(key)) {
            if (seenRegularProp) {
              needsReorder = true;
            }
            eventHandlers.push(key);
          } else {
            seenRegularProp = true;
            regularProps.push(key);
          }
        }
        if (eventHandlers.length === 0 || regularProps.length === 0) {
          return propsObj;
        }
        if (!needsReorder) {
          return propsObj;
        }
        const orderedKeys = [...eventHandlers, ...regularProps];
        return new Proxy(propsObj, {
          ownKeys: () => orderedKeys,
          get: (target, prop) => target[prop],
          getOwnPropertyDescriptor: (target, prop) => {
            if (orderedKeys.includes(prop)) {
              return Object.getOwnPropertyDescriptor(target, prop);
            }
            return void 0;
          }
        });
      };
      if (typeof accessor === "function") {
        const wrappedAccessor = () => {
          const props = accessor();
          if (props && typeof props === "object" && !Array.isArray(props)) {
            return createReorderedProxy(props);
          }
          return props;
        };
        originalSpread(node, wrappedAccessor, skipChildren);
      } else {
        if (accessor && typeof accessor === "object" && !Array.isArray(accessor)) {
          const reordered = createReorderedProxy(accessor);
          originalSpread(node, reordered, skipChildren);
        } else {
          originalSpread(node, accessor, skipChildren);
        }
      }
    };
    renderer.spread = spread;
    return {
      renderer,
      tmFieldChangeHandlerApi
    };
  }

  // node_modules/.pnpm/@roku-sdk+compat@2.19.1_@ro_131921cd3239298493ec9a5f2862402d/node_modules/@roku-sdk/compat/src/tween/index.ts
  registerTagAlias("tween", () => hasFeature("tween") ? "tween" : "RsgTweenShim");

  // node_modules/.pnpm/@roku-sdk+ts-core@2.19.1/node_modules/@roku-sdk/ts-core/src/bootstrap.tsx
  var bootstrapLogger = logger.getLogger("btstp");
  var disposeMap = /* @__PURE__ */ new Map();
  var tsComponentConstructors = /* @__PURE__ */ new Map();
  var tsComponentUpdateInputs = /* @__PURE__ */ new Map();
  var tsComponentUpdateOutputs = /* @__PURE__ */ new Map();
  var focusCapableComponents = /* @__PURE__ */ new Set();
  function canComponentReceiveFocus(name) {
    return focusCapableComponents.has(name);
  }
  var declareApi = void 0;
  function declareTsComponent(declaration, Component) {
    if (!declareApi) {
      throw new Error("Declare API is not set. Make sure setUp is called first");
    }
    const componentNameRef = stringInterner.internString(declaration.componentName);
    const base = declaration.extends === "FocusBoundaryBase" && !hasFeature("focusBoundaryBase") ? "FocusBoundaryBaseShim" : declaration.extends;
    const extendsRef = stringInterner.internString(base);
    if (declaration.libraryName) {
      const libraryNameRef = stringInterner.internString(declaration.libraryName);
      declareApi.declareComponent(componentNameRef, extendsRef, libraryNameRef);
    } else {
      declareApi.declareComponent(componentNameRef, extendsRef);
    }
    if (base === "FocusBoundaryBase" || base === "FocusBoundaryBaseShim") {
      focusCapableComponents.add(declaration.componentName);
    }
    const declareFields = (fields, output) => {
      Object.keys(fields).forEach((key) => {
        const fieldRef = stringInterner.internString(key);
        const defaultValueFn = fields[key];
        if (defaultValueFn === void 0) {
          return;
        }
        const defaultValue = defaultValueFn();
        switch (typeof defaultValue) {
          case "string":
            declareApi.addStringField(componentNameRef, fieldRef, true, output);
            break;
          case "number":
            if (defaultValueFn.isFloat) {
              declareApi.addFloatField(componentNameRef, fieldRef, true, output);
            } else {
              declareApi.addIntField(componentNameRef, fieldRef, true, output);
            }
            break;
          case "boolean":
            declareApi.addBooleanField(componentNameRef, fieldRef, true, output);
            break;
          case "object":
            if (Array.isArray(defaultValue)) {
              declareApi.addArrayField(componentNameRef, fieldRef, true, output);
            } else {
              declareApi.addObjectField(componentNameRef, fieldRef, true, output);
            }
            break;
          default:
            throw new Error("Unsupported field type");
        }
      });
    };
    declareFields(declaration.inputFields, false);
    declareFields(declaration.outputFields, true);
    function constructComponent(anchorNode) {
      const { renderer } = solidRenderer;
      const { render } = renderer;
      const inputs = {};
      const signals = {};
      const inputFields = declaration.inputFields;
      for (const key in inputFields) {
        const defaultValueFn = inputFields[key];
        if (defaultValueFn === void 0) {
          continue;
        }
        const defaultValue = defaultValueFn();
        const signal = createSignal(defaultValue);
        signals[key] = signal;
        Object.defineProperty(inputs, key, {
          get: signal[0],
          enumerable: true,
          configurable: true
        });
      }
      const outputFields = {};
      for (const key in declaration.outputFields) {
        outputFields[key] = () => {
        };
      }
      const updateInputs2 = (inputFieldName, value) => {
        const fieldName = stringInterner.getStringByInternedRef(inputFieldName);
        ;
        if (fieldName) {
          if (signals[fieldName]) {
            const [, setSignal] = signals[fieldName];
            setSignal((prev) => value);
          }
        }
      };
      const updateOutputs2 = (outputFieldName, handler) => {
        const fieldName = stringInterner.getStringByInternedRef(outputFieldName);
        if (fieldName) {
          if (outputFields[fieldName]) {
            outputFields[fieldName] = handler;
          }
        }
      };
      tsComponentUpdateInputs.set(anchorNode.r, updateInputs2);
      tsComponentUpdateOutputs.set(anchorNode.r, updateOutputs2);
      const { registerAnchorNodeEventListener } = anchorNodeManipulationApi;
      for (const key in declaration.outputFields) {
        registerAnchorNodeEventListener(anchorNode.r, stringInterner.internString(key));
      }
      const dispose = render(() => {
        if (DEV) {
          const owner = getOwner();
          if (owner) {
            owner.name = declaration.componentName;
          }
        }
        return createComponent2(ErrorBoundary, {
          fallback: (err) => {
            bootstrapLogger.error(() => ["Error in TS component: ", err.message, "\n", String(err.stack ?? "")].join(""));
            return null;
          },
          get children() {
            return untrack(() => Component(inputs, outputFields));
          }
        });
      }, anchorNode);
      disposeMap.set(anchorNode.r, dispose);
      ;
      return () => {
        const { unregisterAnchorNodeEventListener } = anchorNodeManipulationApi;
        for (const key in declaration.outputFields) {
          unregisterAnchorNodeEventListener(anchorNode.r, stringInterner.internString(key));
        }
        const dispose2 = disposeMap.get(anchorNode.r);
        ;
        if (dispose2) {
          dispose2();
        }
        disposeMap.delete(anchorNode.r);
        tsComponentUpdateInputs.delete(anchorNode.r);
        tsComponentUpdateOutputs.delete(anchorNode.r);
      };
    }
    tsComponentConstructors.set(declaration.componentName, constructComponent);
  }
  function defineAnchorNode(description, component) {
    return [description, component];
  }
  var registerAnchorNode = ([declaration, Component]) => declareTsComponent(declaration, Component);
  function constructor(anchorNode) {
    ;
    if (!solidRenderer) {
      throw new Error("Solid renderer is not created. Make sure setUp is called first");
    }
    const name = stringInterner.getStringByInternedRef(anchorNode.n);
    if (!name) {
      throw new Error("Failed to get name");
    }
    const constructComponent = tsComponentConstructors.get(name);
    if (!constructComponent) {
      throw new Error("Failed to get constructor");
    }
    return constructComponent(anchorNode);
  }
  function updateInputs(anchorNode, inputFieldName, value) {
    ;
    const updateInputs2 = tsComponentUpdateInputs.get(anchorNode.r);
    if (!updateInputs2) {
      throw new Error("Failed to get update props");
    }
    updateInputs2(inputFieldName, value);
  }
  function updateOutputs(anchorNode, outputFieldName, outputHandler) {
    ;
    const updateOutputs2 = tsComponentUpdateOutputs.get(anchorNode.r);
    if (!updateOutputs2) {
      throw new Error("Failed to get update outputs");
    }
    updateOutputs2(outputFieldName, outputHandler);
  }
  var solidRenderer;
  var anchorNodeManipulationApi;
  function setUp({ declareApi: incomingDeclareApi, tmApi: incomingTmApi, anchorNodeApi, internStringApi: internStringApi2, transactionApi: transactionApi2, incomingSDApi, outgoingSDApi }) {
    ;
    registerInternStringApi(internStringApi2);
    declareApi = incomingDeclareApi;
    registerTransactionApi(transactionApi2);
    solidRenderer = makeSolidRenderer(incomingTmApi, incomingSDApi, outgoingSDApi);
    anchorNodeManipulationApi = makeAnchorNodeManager(incomingSDApi, outgoingSDApi, anchorNodeApi);
    roku.Setup.initApiObject({
      anchorNode: anchorNodeManipulationApi,
      structuredData: incomingSDApi,
      treeManipulation: solidRenderer.tmFieldChangeHandlerApi
    });
    ;
  }

  // node_modules/.pnpm/@roku-sdk+ts-core@2.19.1/node_modules/@roku-sdk/ts-core/src/anchor-node.ts
  function makeAnchorNodeManager(incomingSDApi, outgoingSDApi, anchorNodeApi) {
    const { createFullArray: createFullArray2, createFullObject: createFullObject2, commit: sdCommit2 } = createSDHelper(outgoingSDApi);
    const anchorNodes = /* @__PURE__ */ new Map();
    const anchorNodeDestructors = /* @__PURE__ */ new Map();
    function getAnchorNode(nodeRef) {
      const anchorNode = anchorNodes.get(nodeRef);
      if (!anchorNode) {
        throw new Error(`Anchor node not found for ref: ${JSON.stringify(nodeRef)}`);
      }
      return anchorNode;
    }
    function setAnchorNodeProp(nodeRef, fieldName, value) {
      updateInputs(getAnchorNode(nodeRef), fieldName, value);
    }
    const handleOutputFields = (nodeRef, fieldName, eventData) => {
      const eventDataType = typeof eventData;
      transactionManager.startTransaction();
      switch (eventDataType) {
        case "boolean":
          anchorNodeApi.onAnchorNodeBoolPropChange(nodeRef, fieldName, eventData);
          break;
        case "number":
          if (Number.isInteger(eventData)) {
            anchorNodeApi.onAnchorNodeIntPropChange(nodeRef, fieldName, eventData);
          } else {
            anchorNodeApi.onAnchorNodeFloatPropChange(nodeRef, fieldName, eventData);
          }
          break;
        case "string":
          anchorNodeApi.onAnchorNodeStringPropChange(nodeRef, fieldName, eventData);
          break;
        case "object":
          if (eventData === null) {
            anchorNodeApi.onAnchorNodeNullPropChange(nodeRef, fieldName);
          } else if (Array.isArray(eventData)) {
            const arrayRef = createFullArray2(eventData);
            anchorNodeApi.onAnchorNodeArrayPropChange(nodeRef, fieldName, arrayRef);
          } else {
            const objectRef = createFullObject2(eventData);
            anchorNodeApi.onAnchorNodeObjectPropChange(nodeRef, fieldName, objectRef);
          }
          break;
        default:
          logger.error(() => `Unknown event data type ${eventDataType}`);
      }
      sdCommit2();
    };
    return {
      createAnchorNode: (componentName, nodeRef) => {
        const name = stringInterner.getStringByInternedRef(componentName);
        const anchorNode = {
          r: nodeRef,
          n: componentName,
          canReceiveFocus: name ? canComponentReceiveFocus(name) : false
        };
        anchorNodes.set(anchorNode.r, anchorNode);
        const destructor = constructor(anchorNode);
        anchorNodeDestructors.set(anchorNode.r, destructor);
      },
      removeAnchorNode: (nodeRef) => {
        anchorNodeDestructors.get(nodeRef)?.();
        const anchorNode = anchorNodes.get(nodeRef);
        if (anchorNode)
          forgetAnchor(anchorNode);
        anchorNodes.delete(nodeRef);
        anchorNodeDestructors.delete(nodeRef);
      },
      updateAnchorNodePropBool: (nodeRef, fieldName, value) => {
        setAnchorNodeProp(nodeRef, fieldName, value);
      },
      updateAnchorNodePropNull: (nodeRef, fieldName) => {
        setAnchorNodeProp(nodeRef, fieldName, null);
      },
      updateAnchorNodePropInt: (nodeRef, fieldName, value) => {
        setAnchorNodeProp(nodeRef, fieldName, value);
      },
      updateAnchorNodePropFloat: (nodeRef, fieldName, value) => {
        setAnchorNodeProp(nodeRef, fieldName, value);
      },
      updateAnchorNodePropString: (nodeRef, fieldName, value) => {
        setAnchorNodeProp(nodeRef, fieldName, value);
      },
      updateAnchorNodePropObject: (nodeRef, fieldName, ref) => {
        const anchorNode = getAnchorNode(nodeRef);
        const value = incomingSDApi.getObject(ref);
        updateInputs(anchorNode, fieldName, value);
      },
      updateAnchorNodePropArray: (nodeRef, fieldName, ref) => {
        const anchorNode = getAnchorNode(nodeRef);
        const value = incomingSDApi.getArray(ref);
        updateInputs(anchorNode, fieldName, value);
      },
      registerAnchorNodeEventListener: (nodeRef, outputFieldName) => {
        const anchorNode = getAnchorNode(nodeRef);
        const eventHandler = (eventData) => {
          handleOutputFields(nodeRef, outputFieldName, eventData);
        };
        updateOutputs(anchorNode, outputFieldName, eventHandler);
      },
      unregisterAnchorNodeEventListener: (nodeRef, outputFieldName) => {
        const anchorNode = getAnchorNode(nodeRef);
        const eventHandler = () => {
        };
        updateOutputs(anchorNode, outputFieldName, eventHandler);
      },
      removeAllAnchorNodes: () => {
        anchorNodes.forEach((anchorNode, nodeRef) => {
          anchorNodeDestructors.get(nodeRef)?.();
          forgetAnchor(anchorNode);
        });
        anchorNodes.clear();
        anchorNodeDestructors.clear();
      }
    };
  }

  // node_modules/.pnpm/@roku-sdk+ts-core@2.19.1/node_modules/@roku-sdk/ts-core/src/structured-data.ts
  var incomingArrays = /* @__PURE__ */ new Map();
  var incomingObjects = /* @__PURE__ */ new Map();
  var refValue = 0;
  function makeStructuredDataHandler() {
    const appendValue = (arrayRef, value) => {
      const array = incomingArrays.get(arrayRef);
      if (array) {
        array.push(value);
      }
    };
    const insertValue = (objectRef, propName, value) => {
      const array = incomingObjects.get(objectRef);
      if (array) {
        array[propName] = value;
      }
    };
    const notImplemented = () => {
      throw new Error("Not implemented");
    };
    return {
      createArray: () => {
        ++refValue;
        incomingArrays.set(refValue, []);
        return refValue;
      },
      appendArray(arrayRef, value) {
        const valueArray = incomingArrays.get(value);
        appendValue(arrayRef, valueArray);
      },
      appendBool: (arrayRef, value) => appendValue(arrayRef, value),
      appendFloat: (arrayRef, value) => appendValue(arrayRef, value),
      appendInt: (arrayRef, value) => appendValue(arrayRef, value),
      appendNodeRef: (arrayRef, value) => appendValue(arrayRef, value),
      appendNull: (arrayRef) => appendValue(arrayRef, null),
      appendObject(arrayRef, value) {
        const valueObject = incomingObjects.get(value);
        if (!valueObject) {
          throw new Error(`Object ${value} not found`);
        }
        appendValue(arrayRef, valueObject);
      },
      appendString: (arrayRef, value) => appendValue(arrayRef, value),
      createObject() {
        ++refValue;
        incomingObjects.set(refValue, {});
        return refValue;
      },
      insertArray(objectRef, propName, value) {
        const valueArray = incomingArrays.get(value);
        insertValue(objectRef, propName, valueArray);
      },
      insertBool: (objectRef, propName, value) => insertValue(objectRef, propName, value),
      insertFloat: (objectRef, propName, value) => insertValue(objectRef, propName, value),
      insertInt: (objectRef, propName, value) => insertValue(objectRef, propName, value),
      insertNodeRef(objectRef, propName, value) {
        notImplemented();
      },
      insertNull: (objectRef, propName) => insertValue(objectRef, propName, null),
      insertObject(objectRef, propName, value) {
        const valueObject = incomingObjects.get(value);
        if (!valueObject) {
          throw new Error(`Object ${value} not found`);
        }
        insertValue(objectRef, propName, valueObject);
      },
      insertString: (objectRef, propName, value) => insertValue(objectRef, propName, value),
      getArray: (arrayRef) => {
        const arr = incomingArrays.get(arrayRef);
        incomingArrays.delete(arrayRef);
        return arr;
      },
      getObject: (objectRef) => {
        const obj = incomingObjects.get(objectRef);
        incomingObjects.delete(objectRef);
        return obj;
      }
    };
  }

  // node_modules/.pnpm/@roku-sdk+native@2.19.1/node_modules/@roku-sdk/native/src/console-polyfill.ts
  var timers = /* @__PURE__ */ new Map();
  var counters = /* @__PURE__ */ new Map();
  var groupDepth = 0;
  function indent() {
    return "  ".repeat(groupDepth);
  }
  function time(label) {
    const key = label ?? "default";
    if (timers.has(key)) {
      console.warn(`Timer '${key}' already exists`);
      return;
    }
    timers.set(key, Date.now());
  }
  function timeEnd(label) {
    const key = label ?? "default";
    const start = timers.get(key);
    if (start === void 0) {
      console.warn(`Timer '${key}' does not exist`);
      return;
    }
    timers.delete(key);
    const elapsed = Date.now() - start;
    console.log(`${indent()}${key}: ${elapsed}ms`);
  }
  function timeLog(label, ...data) {
    const key = label ?? "default";
    const start = timers.get(key);
    if (start === void 0) {
      console.warn(`Timer '${key}' does not exist`);
      return;
    }
    const elapsed = Date.now() - start;
    if (data.length === 0) {
      console.log(`${indent()}${key}: ${elapsed}ms`);
    } else {
      console.log(`${indent()}${key}: ${elapsed}ms`, ...data);
    }
  }
  function assert(condition, ...data) {
    if (condition) {
      return;
    }
    const prefix = `${indent()}Assertion failed`;
    if (data.length === 0) {
      console.error(prefix);
    } else if (typeof data[0] === "string") {
      console.error(`${prefix}: ${data[0]}`, ...data.slice(1));
    } else {
      console.error(prefix, ...data);
    }
  }
  function count(label) {
    const key = label ?? "default";
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    console.log(`${indent()}${key}: ${next}`);
  }
  function countReset(label) {
    const key = label ?? "default";
    if (!counters.has(key)) {
      console.warn(`Count for '${key}' does not exist`);
      return;
    }
    counters.set(key, 0);
  }
  function group(label) {
    if (label !== void 0) {
      console.log(`${indent()}${label}`);
    }
    groupDepth++;
  }
  function groupEnd() {
    if (groupDepth > 0) {
      groupDepth--;
    }
  }
  function installConsolePolyfill() {
    if (typeof console.time !== "function") {
      console.time = time;
    }
    if (typeof console.timeEnd !== "function") {
      console.timeEnd = timeEnd;
    }
    if (typeof console.timeLog !== "function") {
      console.timeLog = timeLog;
    }
    if (typeof console.assert !== "function") {
      console.assert = assert;
    }
    if (typeof console.count !== "function") {
      console.count = count;
    }
    if (typeof console.countReset !== "function") {
      console.countReset = countReset;
    }
    if (typeof console.group !== "function") {
      console.group = group;
    }
    if (typeof console.groupCollapsed !== "function") {
      console.groupCollapsed = group;
    }
    if (typeof console.groupEnd !== "function") {
      console.groupEnd = groupEnd;
    }
  }

  // node_modules/.pnpm/@roku-sdk+native@2.19.1/node_modules/@roku-sdk/native/src/fetch-polyfill.ts
  function Request(url, init) {
    return globalThis.RequestHostFunc.call(null, url, init);
  }
  function HttpsAgent(options) {
    return globalThis.HttpsAgentHostFunc.call(null, options);
  }
  function Headers(init) {
    return globalThis.HeadersHostFunc.call(null, init);
  }
  globalThis.Request = Request;
  globalThis.HttpsAgent = HttpsAgent;
  globalThis.Headers = Headers;

  // node_modules/.pnpm/@roku-sdk+native@2.19.1/node_modules/@roku-sdk/native/src/process.ts
  function getManifestSourceMapSHA() {
    try {
      const appInfo = roku.getRuntimeSingletonSync("AppInfo");
      if (!appInfo) {
        return "<none>";
      }
      const sha = appInfo.getManifestValue("hbc_source_map_sha");
      return sha || "<none>";
    } catch {
      return "<none>";
    }
  }
  function buildSourceMapTag() {
    const hostSha = getManifestSourceMapSHA();
    const parts = [`index:${hostSha}`];
    const dclShas = globalThis.__DCL_SOURCE_MAP_SHAS;
    if (dclShas) {
      for (const lib in dclShas) {
        parts.push(`${lib}:${dclShas[lib]}`);
      }
    }
    return parts.join(" ");
  }
  function logExceptionWithSHA(error) {
    logger.error(() => error ? error.toString() : "Uncaught exception");
    const sha = getManifestSourceMapSHA();
    logger.error(() => `source_map_sha=${sha}`);
    const dclShas = globalThis.__DCL_SOURCE_MAP_SHAS;
    if (dclShas) {
      const _loop_1 = (lib) => {
        logger.error(() => `source_map_sha=${lib}:${dclShas[lib]}`);
      };
      for (const lib in dclShas) {
        _loop_1(lib);
      }
    }
    return sha;
  }
  function formatCallSite(frame) {
    const fn = frame.getFunctionName();
    const file = frame.getFileName() ?? "<anonymous>";
    const line = frame.getLineNumber() ?? 0;
    const col = frame.getColumnNumber() ?? 0;
    const loc = `${file}:${line}:${col}`;
    if (frame.isConstructor()) {
      return `    at new ${fn ?? "<anonymous>"} (${loc})`;
    }
    return fn ? `    at ${fn} (${loc})` : `    at ${loc}`;
  }
  var exceptionTaggingEnabled = false;
  function enableExceptionTagging() {
    if (exceptionTaggingEnabled)
      return;
    exceptionTaggingEnabled = true;
    let useCustomFormatter = false;
    try {
      const testError = new Error();
      const testStack = [];
      const originalPrepare = Error.prepareStackTrace;
      Error.prepareStackTrace = (_e, stack) => {
        testStack.push(...stack);
        return "";
      };
      const errorWithCapture = Error;
      errorWithCapture.captureStackTrace?.(testError);
      void testError.stack;
      Error.prepareStackTrace = originalPrepare;
      const firstFrame = testStack[0];
      useCustomFormatter = firstFrame !== void 0 && firstFrame.getColumnNumber() !== null;
    } catch {
      useCustomFormatter = false;
    }
    if (useCustomFormatter) {
      Error.prepareStackTrace = (error, stack) => {
        const newline = String.fromCharCode(10);
        const rawStackTrace = stack.map((frame) => formatCallSite(frame)).join(newline);
        const tag = buildSourceMapTag();
        return [error.toString(), newline, rawStackTrace, newline, "    [SourceMap: ", tag, "]", newline].join("");
      };
    } else {
      const originalStackGetter = Object.getOwnPropertyDescriptor(Error.prototype, "stack")?.get;
      if (originalStackGetter) {
        Object.defineProperty(Error.prototype, "stack", {
          get: function() {
            const nativeStack = originalStackGetter.call(this);
            if (typeof nativeStack === "string" && !nativeStack.includes("[SourceMap:")) {
              const tag = buildSourceMapTag();
              return [nativeStack, "\n    [SourceMap: ", tag, "]\n"].join("");
            }
            return nativeStack;
          },
          configurable: true
        });
      }
    }
  }
  var customExceptionHandler = null;
  function setupProcessHandlers(processApi) {
    processApi.setUncaughtExceptionCaptureCallback((error, done) => {
      const sha = logExceptionWithSHA(error);
      if (customExceptionHandler) {
        customExceptionHandler(error, sha, done);
      } else {
        done(true);
      }
    });
    processApi.setUnhandledRejectionCallback((id, error) => {
      logger.error(() => error ? error.toString() : `Unhandled rejection with id: ${id}`);
    });
  }
  if (typeof globalThis.Process !== "undefined") {
    setupProcessHandlers(globalThis.Process);
  }

  // node_modules/.pnpm/@roku-sdk+native@2.19.1/node_modules/@roku-sdk/native/src/index.ts
  if (true) {
    installConsolePolyfill();
  }
  var runtimeSetUp = false;
  function main(declare) {
    if (runtimeSetUp) {
      ;
    } else {
      runtimeSetUp = true;
      setUpRuntime();
    }
    declare();
    roku.ComponentDeclarationApi.commit();
  }
  function setUpRuntime() {
    logger.info(() => "main begins");
    const internStringApi2 = roku.InternStringApi;
    const tmApi3 = roku.TreeManipulationApi;
    const anchorNodeApi = roku.AnchorManipulationEventApi;
    const declareApi2 = roku.ComponentDeclarationApi;
    const transactionApi2 = roku.Transaction;
    if (typeof transactionApi2.setErrorCallback === "function") {
      const txLogger2 = logger.getLogger("tx");
      transactionApi2.setErrorCallback((errorRef, count2) => {
        const _loop_1 = (index) => {
          txLogger2.error(() => {
            const reason = transactionApi2.getErrorReason?.(errorRef, index);
            const reasonName = Object.keys(roku.TmErrorReason ?? {}).find((name) => roku.TmErrorReason?.[name] === reason) ?? reason;
            const details = [["operation", transactionApi2.getErrorOperation?.(errorRef, index)], ["nodeId", transactionApi2.getErrorNodeId?.(errorRef, index)], ["propName", transactionApi2.getErrorPropName?.(errorRef, index)]].filter(([, value]) => value !== void 0).map(([key, value]) => `${key}=${value}`);
            return `Transaction error ${reasonName}: ${transactionApi2.getErrorMessage?.(errorRef, index) ?? ""}${details.length ? ` (${details.join(", ")})` : ""}`;
          });
        };
        for (let index = 0; index < count2; index++) {
          _loop_1(index);
        }
      });
    }
    const incomingSDApi = makeStructuredDataHandler();
    const outgoingSDApi = roku.StructuredDataApi;
    setUp({
      declareApi: declareApi2,
      tmApi: tmApi3,
      anchorNodeApi,
      internStringApi: internStringApi2,
      transactionApi: transactionApi2,
      incomingSDApi,
      outgoingSDApi
    });
  }

  // src/components/roku-typescript-app.tsx
  var RokuTypescriptAppDescriptor = {
    componentName: "RokuTypescriptApp",
    extends: "Group",
    inputFields: {},
    outputFields: {}
  };
  var RokuTypescriptApp = () => {
    const appTitle = "crazino-typeScript";
    const appSubtitle = "Powered by Roku RSG 2.0";
    const [counter, setCounter] = createSignal(5);
    return (() => {
      var _el$ = createElement("layoutGroup"), _el$2 = createElement("label"), _el$3 = createElement("label"), _el$4 = createElement("label"), _el$5 = createElement("buttonGroup");
      insertNode(_el$, _el$2);
      insertNode(_el$, _el$3);
      insertNode(_el$, _el$4);
      insertNode(_el$, _el$5);
      setProp(_el$, "translation", [0, 540]);
      setProp(_el$, "layoutDirection", "vert");
      setProp(_el$, "vertAlignment", "center");
      setProp(_el$2, "id", "titleLabel");
      setProp(_el$2, "color", "0xFFFFFFFF");
      setProp(_el$2, "font", "font:ExtraLargeSystemFont");
      setProp(_el$2, "text", "crazino-typeScript");
      setProp(_el$2, "horizAlign", "center");
      setProp(_el$2, "vertAlign", "center");
      setProp(_el$2, "width", 1920);
      setProp(_el$2, "height", 100);
      setProp(_el$3, "id", "subtitleLabel");
      setProp(_el$3, "color", "0xFFFFFFFF");
      setProp(_el$3, "font", "font:LargeSystemFont");
      setProp(_el$3, "text", "Powered by Roku RSG 2.0");
      setProp(_el$3, "horizAlign", "center");
      setProp(_el$3, "vertAlign", "center");
      setProp(_el$3, "width", 1920);
      setProp(_el$3, "height", 80);
      setProp(_el$4, "color", "0x00FF00FF");
      setProp(_el$4, "font", "font:LargeSystemFont");
      setProp(_el$4, "horizAlign", "center");
      setProp(_el$4, "width", 1920);
      setProp(_el$4, "height", 80);
      setProp(_el$5, "onButtonSelected", (index) => {
        if (index === 0) {
          setCounter(counter() + 1);
        } else if (index === 1) {
          setCounter(counter() - 1);
        }
      });
      setProp(_el$5, "buttons", ["Increase counter", "Decrease counter"]);
      setProp(_el$5, "focusButton", 0);
      setProp(_el$5, "minWidth", 520);
      setProp(_el$5, "buttonHeight", 72);
      setProp(_el$5, "showFocusFootprint", true);
      effect((_$p) => setProp(_el$4, "text", `Counter: ${counter()}`, _$p));
      return _el$;
    })();
  };
  var roku_typescript_app_default = defineAnchorNode(RokuTypescriptAppDescriptor, RokuTypescriptApp);

  // src/index.ts
  main(() => {
    enableExceptionTagging();
    console.log("Registering RokuTypescriptApp");
    registerAnchorNode(roku_typescript_app_default);
  });
})();
//# sourceMappingURL=index.js.map
