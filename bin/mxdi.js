var mxdi;
(function (mxdi) {
    var Event = (function () {
        function Event() {
            this.handlers = [];
        }
        Event.prototype.once = function (callback) {
            this.handlers.push({
                once: true,
                callback: callback
            });
        };
        Event.prototype.on = function (callback) {
            this.handlers.push({
                once: false,
                callback: callback
            });
        };
        Event.prototype.remove = function (callback) {
            this.handlers =
                this.handlers.filter(function (handler) {
                    return handler.callback != callback;
                });
        };
        Event.prototype.emit = function (data) {
            this.handlers.forEach(function (handler) {
                return handler.callback(data);
            });
            this.handlers =
                this.handlers.filter(function (handler) {
                    return handler.once == false;
                });
        };
        return Event;
    })();
    var EventEmitter = (function () {
        function EventEmitter() {
            this.events = [];
        }
        EventEmitter.prototype.once = function (name, callback) {
            if (!this.events[name]) {
                this.events[name] = new Event();
            }
            this.events[name].once(callback);
        };
        EventEmitter.prototype.on = function (name, callback) {
            if (!this.events[name]) {
                this.events[name] = new Event();
            }
            this.events[name].on(callback);
        };
        EventEmitter.prototype.remove = function (name, callback) {
            if (!this.events[name]) {
                this.events[name].remove(callback);
            }
        };
        EventEmitter.prototype.emit = function (name, data) {
            if (this.events[name]) {
                this.events[name].emit(data);
            }
        };
        return EventEmitter;
    })();
    mxdi.EventEmitter = EventEmitter;
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var Task = (function () {
        function Task(resolver) {
            var _this = this;
            this.state = "pending";
            this.thens = [];
            this.catches = [];
            this.value = null;
            this.error = null;
            setTimeout(function () {
                try {
                    resolver(function (value) { return _this.resolve(value); }, function (error) { return _this.reject(error); });
                }
                catch (error) {
                    _this.reject(error);
                }
            });
        }
        Task.prototype.then = function (callback) {
            switch (this.state) {
                case "pending":
                    this.thens.push(callback);
                    break;
                case "resolved":
                    callback(this.value);
                    break;
                case "rejected": break;
            }
            return this;
        };
        Task.prototype.catch = function (callback) {
            switch (this.state) {
                case "pending":
                    this.catches.push(callback);
                    break;
                case "rejected":
                    callback(this.error);
                    break;
                case "resolved": break;
            }
            return this;
        };
        Task.prototype.resolve = function (value) {
            switch (this.state) {
                case "pending":
                    this.state = "resolved";
                    this.value = value;
                    this.thens.forEach(function (callback) { return callback(value); });
                    this.thens = [];
                    this.catches = [];
                    break;
            }
        };
        Task.prototype.reject = function (error) {
            switch (this.state) {
                case "pending":
                    this.state = "rejected";
                    this.error = error;
                    this.catches.forEach(function (callback) { return callback(error); });
                    this.thens = [];
                    this.catches = [];
                    break;
            }
        };
        Task.all = function (tasks) {
            return new Task(function (resolve, reject) {
                if (tasks.length == 0) {
                    resolve([]);
                    return;
                }
                var completed = 0;
                var values = new Array(tasks.length);
                tasks.forEach(function (task, index) {
                    task.then(function (value) {
                        completed += 1;
                        values[index] = value;
                        if (completed == tasks.length)
                            resolve(values);
                    }).catch(reject);
                });
            });
        };
        return Task;
    })();
    mxdi.Task = Task;
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var Queue = (function () {
        function Queue(concurrency) {
            if (concurrency === void 0) { concurrency = 1; }
            this.concurrency = concurrency;
            this.queue = [];
            this.paused = false;
            this.running = 0;
        }
        Queue.prototype.run = function (operation) {
            this.queue.push(operation);
            this.next();
        };
        Queue.prototype.next = function () {
            var _this = this;
            if (this.queue.length > 0) {
                if (this.running < this.concurrency) {
                    var operation = this.queue.shift();
                    this.running += 1;
                    operation(function () {
                        _this.running -= 1;
                        if (!_this.paused)
                            setTimeout(function () { return _this.next(); });
                    });
                }
            }
        };
        return Queue;
    })();
    mxdi.Queue = Queue;
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var loop;
    (function (loop) {
        var running = false;
        var update_handlers = [];
        var render_handlers = [];
        function start() {
            if (!running) {
                running = true;
                var step = function () {
                    update_handlers.forEach(function (handler) {
                        var now = new Date();
                        var delta = now.getTime() - handler.last.getTime();
                        var elapsed = now.getTime() - handler.started.getTime();
                        handler.last = now;
                        handler.callback({
                            delta: delta,
                            runtime: elapsed
                        });
                    });
                    render_handlers.forEach(function (handler) {
                        var now = new Date();
                        var delta = now.getTime() - handler.last.getTime();
                        var elapsed = now.getTime() - handler.started.getTime();
                        handler.last = now;
                        handler.callback({
                            delta: delta,
                            runtime: elapsed
                        });
                    });
                    if (running) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
            }
        }
        loop.start = start;
        function stop() {
            running = false;
        }
        loop.stop = stop;
        function update(callback) {
            update_handlers.push({
                started: new Date(),
                last: new Date(),
                callback: callback
            });
        }
        loop.update = update;
        function render(callback) {
            render_handlers.push({
                started: new Date(),
                last: new Date(),
                callback: callback
            });
        }
        loop.render = render;
    })(loop = mxdi.loop || (mxdi.loop = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    function resolvePath(base, path) {
        if (path.indexOf("http") == 0)
            return path;
        var stack = base.split("/");
        var parts = path.split("/");
        stack.pop();
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var pending = null;
    var descriptors = {};
    var cache = {};
    var queue = new mxdi.Queue(1);
    function request(name) {
        return new mxdi.Task(function (resolve, reject) {
            queue.run(function (next) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("readystatechange", function (event) {
                    if (xhr.readyState == 4) {
                        switch (xhr.status) {
                            case 200:
                                resolve(xhr.responseText);
                                break;
                            default:
                                reject("unable to load " + name);
                                break;
                        }
                        next();
                    }
                }, false);
                xhr.open("GET", name + ".js", true);
                xhr.send();
            });
        });
    }
    function load(name) {
        return new mxdi.Task(function (resolve, reject) {
            if (!descriptors[name]) {
                request(name).then(function (source) {
                    var head = document.getElementsByTagName("head")[0];
                    var script = document.createElement("script");
                    var code = document.createTextNode(source);
                    script.type = "text/javascript";
                    script.appendChild(code);
                    head.appendChild(script);
                    setTimeout(function () {
                        if (pending) {
                            descriptors[name] = {
                                name: name,
                                names: pending.names,
                                callback: pending.callback
                            };
                            pending = null;
                            resolve(descriptors[name]);
                            return;
                        }
                        reject("unable to locate define for " + name);
                    });
                }).catch(reject);
            }
            else
                resolve(descriptors[name]);
        });
    }
    function boot(descriptor) {
        return new mxdi.Task(function (resolve, reject) {
            mxdi.Task.all(descriptor.names.map(load)).then(function (descriptors) {
                mxdi.Task.all(descriptors.map(boot)).then(function (exports) {
                    if (cache[descriptor.name]) {
                        resolve(cache[descriptor.name]);
                    }
                    else {
                        cache[descriptor.name] =
                            descriptor.callback.apply(descriptor.callback, exports);
                        resolve(cache[descriptor.name]);
                    }
                }).catch(reject);
            }).catch(reject);
        });
    }
    function define(args) {
        if (arguments.length == 3)
            descriptors[arguments[0]] = {
                name: arguments[0],
                names: arguments[1],
                callback: arguments[2]
            };
        if (arguments.length == 2)
            pending = {
                name: 'unknown',
                names: arguments[0],
                callback: arguments[1]
            };
    }
    mxdi.define = define;
    function require(names, callback) {
        return boot({
            name: undefined,
            names: names,
            callback: callback
        });
    }
    mxdi.require = require;
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var input;
    (function (input) {
        var gamepad;
        (function (gamepad_1) {
            var gamepads = [];
            gamepad_1.enabled = false;
            gamepad_1.buttons = { a: 0.0, b: 0.0, x: 0.0, y: 0.0, start: 0.0, select: 0.0 };
            gamepad_1.dpad = { up: 0.0, down: 0.0, left: 0.0, right: 0.0 };
            gamepad_1.sticks = {
                left: { x: 0.0, y: 0.0, button: 0.0 },
                right: { x: 0.0, y: 0.0, button: 0.0 }
            };
            gamepad_1.shoulders = {
                left: { top: 0.0, bottom: 0.0 },
                right: { top: 0.0, bottom: 0.0 }
            };
            var connect = function (gamepad) { return gamepads.push(gamepad); };
            var disconnect = function (gamepad) {
                return gamepads = gamepads.filter(function (item) { return item.index != gamepad.index; });
            };
            var poll = function () {
                var _navigator = navigator;
                var current = (_navigator.getGamepads &&
                    _navigator.getGamepads()) ||
                    (_navigator.webkitGetGamepads &&
                        _navigator.webkitGetGamepads());
                if (current) {
                    if (current.length != gamepads.length) {
                        gamepads = [];
                        for (var i = 0; i < current.length; i++) {
                            if (current[i]) {
                                connect(current[i]);
                            }
                        }
                    }
                }
            };
            var process_button = function (button) {
                return (typeof (button) == 'object') ? button.value : button;
            };
            var _navigator = navigator;
            if (_navigator.getGamepads ||
                !!_navigator.webkitGetGamepads ||
                !!_navigator.webkitGamepads) {
                if ('ongamepadconnected' in window) {
                    window.addEventListener('gamepadconnected', function (event) { return connect(event.gamepad); }, false);
                    window.addEventListener('gamepaddisconnected', function (event) { return disconnect(event.gamepad); }, false);
                }
                else {
                    setInterval(function () { return poll(); });
                }
            }
            if (_navigator.getGamepads ||
                !!_navigator.webkitGetGamepads ||
                !!_navigator.webkitGamepads) {
                mxdi.loop.update(function () {
                    gamepad_1.enabled = gamepads.length > 0;
                    gamepads.forEach(function (gamepad) {
                        gamepad_1.sticks.left.x = gamepad.axes[0];
                        gamepad_1.sticks.left.y = gamepad.axes[1];
                        gamepad_1.sticks.right.x = gamepad.axes[2];
                        gamepad_1.sticks.right.y = gamepad.axes[3];
                        gamepad_1.buttons.a = process_button(gamepad.buttons[0]);
                        gamepad_1.buttons.b = process_button(gamepad.buttons[1]);
                        gamepad_1.buttons.x = process_button(gamepad.buttons[2]);
                        gamepad_1.buttons.y = process_button(gamepad.buttons[3]);
                        gamepad_1.shoulders.left.top = process_button(gamepad.buttons[4]);
                        gamepad_1.shoulders.left.bottom = process_button(gamepad.buttons[6]);
                        gamepad_1.shoulders.right.top = process_button(gamepad.buttons[5]);
                        gamepad_1.shoulders.right.bottom = process_button(gamepad.buttons[7]);
                        gamepad_1.buttons.select = process_button(gamepad.buttons[8]);
                        gamepad_1.buttons.start = process_button(gamepad.buttons[9]);
                        gamepad_1.sticks.left.button = process_button(gamepad.buttons[10]);
                        gamepad_1.sticks.right.button = process_button(gamepad.buttons[11]);
                        gamepad_1.dpad.up = process_button(gamepad.buttons[12]);
                        gamepad_1.dpad.down = process_button(gamepad.buttons[13]);
                        gamepad_1.dpad.left = process_button(gamepad.buttons[14]);
                        gamepad_1.dpad.right = process_button(gamepad.buttons[15]);
                    });
                });
            }
        })(gamepad = input.gamepad || (input.gamepad = {}));
    })(input = mxdi.input || (mxdi.input = {}));
})(mxdi || (mxdi = {}));
var tau;
(function (tau) {
    var animation;
    (function (animation) {
        function lerp(src, dst, amount) {
            var delta = dst - src;
            return src + (delta * amount);
        }
        animation.lerp = lerp;
    })(animation = tau.animation || (tau.animation = {}));
})(tau || (tau = {}));
var mxdi;
(function (mxdi) {
    var animation;
    (function (animation) {
        var Animation = (function () {
            function Animation(frames, interpolation) {
                this.frames = frames;
                this.interpolation = interpolation;
                this.frames = this.frames.sort(function (a, b) {
                    if (a.time > b.time)
                        return 1;
                    if (a.time < b.time)
                        return -1;
                    return 0;
                });
            }
            Animation.prototype.get = function (millisecond, repeat) {
                repeat = repeat || false;
                var first = this.frames[0];
                var last = this.frames[frames.length - 1];
                if (repeat)
                    millisecond = millisecond % last.time;
                if (millisecond <= first.time)
                    return first.value;
                if (millisecond >= last.time)
                    return last.value;
                var src = null;
                var dst = null;
                for (var i = (frames.length - 1); i >= 0; i--) {
                    if (millisecond >= this.frames[i].time) {
                        src = frames[i];
                        if (i < frames.length - 1)
                            dst = frames[i + 1];
                        else
                            src = frames[i];
                        break;
                    }
                }
                var delta_0 = dst.time - src.time;
                var delta_1 = dst.time - millisecond;
                var amount = (delta_1 != 0) ? delta_1 / delta_0 : 0;
                amount = -amount + 1;
                return this.interpolation(src.value, dst.value, amount);
            };
            return Animation;
        })();
        animation.Animation = Animation;
    })(animation = mxdi.animation || (mxdi.animation = {}));
})(mxdi || (mxdi = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Element = (function (_super) {
            __extends(Element, _super);
            function Element(element) {
                var _this = this;
                _super.call(this);
                this.element = element;
                this.width = this.element.offsetWidth;
                this.height = this.element.offsetHeight;
                mxdi.loop.update(function () {
                    if (_this.width != _this.element.offsetWidth ||
                        _this.height != _this.element.offsetHeight) {
                        _this.width = _this.element.offsetWidth;
                        _this.height = _this.element.offsetHeight;
                        _this.emit("resize", {
                            width: _this.element.offsetWidth,
                            height: _this.element.offsetHeight
                        });
                    }
                });
            }
            Element.prototype.appendChild = function (element) {
                this.element.appendChild(element);
            };
            return Element;
        })(mxdi.EventEmitter);
        graphics.Element = Element;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Effect = (function () {
            function Effect(source_or_function) {
                var source = this.parse_to_string(source_or_function);
                var uniforms = this.parse_uniforms(source);
                uniforms.resolution = {
                    type: "v2",
                    value: new THREE.Vector2(0, 0)
                };
                this.material = new THREE.ShaderMaterial({
                    depthWrite: false,
                    uniforms: uniforms,
                    fragmentShader: this.prepare_effect(source),
                    vertexShader: [
                        "varying vec2  texcoord;",
                        "uniform vec2  resolution;",
                        "void main() {",
                        "texcoord = uv;",
                        "	gl_Position = projectionMatrix * ",
                        "		modelViewMatrix * vec4(",
                        "		position.x * resolution.x,",
                        "		position.y * resolution.y,",
                        "		position.z,  1.0 );",
                        "}"
                    ].join('\n')
                });
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(100, 100, 100, 100, -10000, 10000);
                this.plane = new THREE.PlaneBufferGeometry(1, 1);
                this.mesh = new THREE.Mesh(this.plane, this.material);
                this.mesh.position.z = -100;
                this.scene.add(this.mesh);
            }
            Effect.prototype.render = function (renderer, uniforms, target) {
                var _this = this;
                var half_width = target.width / 2;
                var half_height = target.height / 2;
                this.camera.left = -half_width;
                this.camera.right = half_width;
                this.camera.top = half_height;
                this.camera.bottom = -half_height;
                this.camera.updateProjectionMatrix();
                this.material.uniforms.resolution.value =
                    new THREE.Vector2(target.width, target.height);
                Object.keys(uniforms).forEach(function (key) {
                    if (_this.material.uniforms[key])
                        _this.material.uniforms[key].value =
                            uniforms[key];
                });
                renderer.setClearColor(0x000000);
                renderer.render(this.scene, this.camera, target, true);
            };
            Effect.prototype.dispose = function () {
                this.material.dispose();
                this.plane.dispose();
            };
            Effect.prototype.parse_to_string = function (string_or_func) {
                if (typeof string_or_func === "function") {
                    var src = string_or_func.toString();
                    var body = src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
                    if ((body.charAt(0) != '/') ||
                        (body.charAt(1) != '*') ||
                        (body.charAt(body.length - 2) != '*') ||
                        (body.charAt(body.length - 1) != '/'))
                        throw Error("parse_to_string: shader_func not properly formatted");
                    return body.substring(2, body.length - 2);
                }
                else if (typeof string_or_func === 'string' || string_or_func instanceof String) {
                    return string_or_func;
                }
                else {
                    throw Error("parse_to_string: not a function or string.");
                }
            };
            Effect.prototype.parse_uniforms = function (source) {
                return source
                    .split('\n')
                    .filter(function (line) { return line.indexOf('uniform') != -1; })
                    .map(function (line) { return line
                    .split(' ')
                    .filter(function (item) { return item.length > 0; })
                    .map(function (item) { return item.replace(';', '').replace('\r', ''); })
                    .reduce(function (param, token, index) {
                    switch (index) {
                        case 0: break;
                        case 1:
                            switch (token) {
                                case "int":
                                    param.type = 'i';
                                    break;
                                case "float":
                                    param.type = 'f';
                                    break;
                                case "vec2":
                                    param.type = 'v2';
                                    break;
                                case "vec3":
                                    param.type = 'v3';
                                    break;
                                case "vec4":
                                    param.type = 'v4';
                                    break;
                                case "mat3":
                                    param.type = 'm3';
                                    break;
                                case "mat4":
                                    param.type = 'm4';
                                    break;
                                case "sampler2D":
                                    param.type = 't';
                                    break;
                                case "samplerCube":
                                    param.type = 't';
                                    break;
                                default: break;
                            }
                            ;
                            break;
                        case 2:
                            param.name = token;
                            break;
                    }
                    ;
                    return param;
                }, {}); })
                    .reduce(function (prev, current) {
                    if (current) {
                        prev[current.name] = { type: current.type, value: null };
                    }
                    ;
                    return prev;
                }, {});
            };
            Effect.prototype.prepare_effect = function (source) {
                return [
                    "varying vec2  texcoord;",
                    source,
                    "void main() { gl_FragColor = effect(texcoord); }"]
                    .join('\n');
            };
            return Effect;
        })();
        graphics.Effect = Effect;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            function Renderer(element) {
                _super.call(this);
                this.element = element;
                this.initialize();
            }
            Renderer.prototype.initialize = function () {
                var _this = this;
                this.element.appendChild(this.domElement);
                this.setSize(this.element.width, this.element.height);
                this.element.on("resize", function (_) {
                    return _this.setSize(_this.element.width, _this.element.height);
                });
                this.shadowMap.enabled = true;
                this.shadowMap.type = THREE.BasicShadowMap;
                this.setClearColor(0xFFFFFF);
                this.material = new THREE.ShaderMaterial({
                    depthWrite: false,
                    uniforms: {
                        map: { type: "t", value: null },
                        scale: { type: "v2", value: [0, 0] }
                    },
                    vertexShader: [
                        "varying vec2  texcoord;",
                        "uniform vec2  scale;",
                        "void main() {",
                        "	texcoord = uv;",
                        "	gl_Position = projectionMatrix * ",
                        "		modelViewMatrix * vec4(",
                        "		position.x * scale.x,",
                        "		position.y * scale.y,",
                        "		position.z,  1.0 );",
                        "}"
                    ].join('\n'),
                    fragmentShader: [
                        "varying  vec2 	texcoord;",
                        "uniform sampler2D map;",
                        "void main() {",
                        "	gl_FragColor = texture2D( map, texcoord );",
                        "}"
                    ].join('\n')
                });
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(100, 100, 100, 100, -10000, 10000);
                this.plane = new THREE.PlaneBufferGeometry(1, 1);
                this.mesh = new THREE.Mesh(this.plane, this.material);
                this.mesh.position.z = -100;
                this.scene.add(this.mesh);
            };
            Renderer.prototype.output = function (texture, crop) {
                var width = this.element.width;
                var height = this.element.height;
                var half_width = width / 2;
                var half_height = height / 2;
                var scalex = width;
                var scaley = height;
                if (crop != undefined && crop == true) {
                    if (scalex > scaley)
                        scaley = scalex;
                    if (scalex < scaley)
                        scalex = scaley;
                }
                this.camera.left = -half_width;
                this.camera.right = half_width;
                this.camera.top = half_height;
                this.camera.bottom = -half_height;
                this.camera.updateProjectionMatrix();
                this.material.uniforms.map.value = texture;
                this.material.uniforms.scale.value = new THREE.Vector2(scalex, scaley);
                -this.render(this.scene, this.camera);
            };
            return Renderer;
        })(THREE.WebGLRenderer);
        graphics.Renderer = Renderer;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Target = (function (_super) {
            __extends(Target, _super);
            function Target(width, height, options) {
                _super.call(this, width, height, options);
            }
            return Target;
        })(THREE.WebGLRenderTarget);
        graphics.Target = Target;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Canvas = (function () {
            function Canvas(options) {
                this.options = options;
                this._canvas = document.createElement('canvas');
                this._context = this._canvas.getContext('2d');
                this._texture = new THREE.Texture(this._canvas);
                var ratio = 1;
                this._canvas.width = this.options.width * ratio;
                this._canvas.height = this.options.height * ratio;
                this._canvas.style.width = this.options.width + "px";
                this._canvas.style.height = this.options.height + "px";
                this._context.setTransform(ratio, 0, 0, ratio, 0, 0);
            }
            Canvas.prototype.context = function () {
                this._texture.needsUpdate = true;
                return this._context;
            };
            Canvas.prototype.texture = function () {
                return this._texture;
            };
            Canvas.prototype.dispose = function () {
                this._texture.dispose();
            };
            return Canvas;
        })();
        graphics.Canvas = Canvas;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        var Console = (function () {
            function Console(options) {
                this.options = options;
                this.buffer = [];
                this.initialize();
            }
            Console.prototype.initialize = function () {
                this.options = this.options || {};
                this.options.width = this.options.width || 256;
                this.options.height = this.options.height || 256;
                this.options.color = this.options.color || "white";
                this.options.backgroundColor = this.options.backgroundColor || "black";
                this.options.font = this.options.font || "monospace";
                this.options.fontsize = this.options.fontsize || 16;
                this.options.lineheight = this.options.lineheight || this.options.fontsize / 4;
                this.options.buffersize = this.options.buffersize || 1024;
                this.canvas = new mxdi.graphics.Canvas({
                    width: this.options.width,
                    height: this.options.height
                });
                this.log("initialize");
                this.clear();
            };
            Console.prototype.texture = function () {
                return this.canvas.texture();
            };
            Console.prototype.dispose = function () {
                this.canvas.dispose();
            };
            Console.prototype.clear = function () {
                this.buffer = [];
                this.draw();
            };
            Console.prototype.log = function (message) {
                var _this = this;
                var context = this.canvas.context();
                if (typeof message !== "string")
                    message = message.toString();
                var temp = [];
                message.split('').forEach(function (char) {
                    temp.push(char);
                    var metrics = context.measureText(temp.join(''));
                    if (metrics.width > _this.options.width) {
                        temp.pop();
                        var line = temp.join('').trim();
                        if (line.length > 0)
                            _this.buffer.push(line);
                        temp = [char];
                    }
                });
                var line = temp.join('').trim();
                if (line.length > 0)
                    this.buffer.push(line);
                while (this.buffer.length >
                    this.options.buffersize)
                    this.buffer.shift();
                this.draw();
            };
            Console.prototype.draw = function () {
                var _this = this;
                var context = this.canvas.context();
                var subset = this.buffer.slice(Math.max(this.buffer.length -
                    (this.options.height / this.options.fontsize), 0)).reverse();
                context.fillStyle = this.options.backgroundColor;
                context.fillRect(0, 0, this.options.width, this.options.height);
                context.font = this.options.fontsize.toString() + "px " + this.options.font;
                context.fillStyle = this.options.color;
                subset.forEach(function (line, index) {
                    var y = (_this.options.height - (_this.options.lineheight * 2)) -
                        (index * (_this.options.fontsize + _this.options.lineheight));
                    context.fillText(line, 4, y);
                });
            };
            return Console;
        })();
        graphics.Console = Console;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var graphics;
    (function (graphics) {
        function load_json(url) {
            return new mxdi.Task(function (resolve, reject) {
                var loader = new THREE.JSONLoader();
                loader.load(url, function (geometry, materials) {
                    resolve({
                        geometry: geometry,
                        materials: materials
                    });
                });
            });
        }
        function load_texture(url) {
            return new mxdi.Task(function (resolve, reject) {
                var loader = new THREE.TextureLoader();
                loader.load(url, function (texture) {
                    resolve(texture);
                });
            });
        }
        function load(type, url) {
            switch (type) {
                case "texture": return load_texture(url);
                case "json": return load_json(url);
                default: return new mxdi.Task(function (resolve, reject) {
                    return reject('unknown type');
                });
            }
        }
        graphics.load = load;
    })(graphics = mxdi.graphics || (mxdi.graphics = {}));
})(mxdi || (mxdi = {}));
var mxdi;
(function (mxdi) {
    var ready = false;
    window.addEventListener("load", function () { return ready = true; });
    function app(elementid, callback) {
        var create_app = function () {
            var domelement = document.getElementById(elementid);
            var element = new mxdi.graphics.Element(domelement);
            var renderer = new mxdi.graphics.Renderer(element);
            callback({
                element: element,
                renderer: renderer,
            });
            mxdi.loop.start();
        };
        if (!ready)
            window.addEventListener("load", create_app, false);
        else
            create_app();
    }
    mxdi.app = app;
})(mxdi || (mxdi = {}));
