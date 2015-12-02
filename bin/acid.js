var acid;
(function (acid) {
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
    var Events = (function () {
        function Events() {
            this.events = [];
        }
        Events.prototype.once = function (name, callback) {
            if (!this.events[name]) {
                this.events[name] = new Event();
            }
            this.events[name].once(callback);
        };
        Events.prototype.on = function (name, callback) {
            if (!this.events[name]) {
                this.events[name] = new Event();
            }
            this.events[name].on(callback);
        };
        Events.prototype.remove = function (name, callback) {
            if (!this.events[name]) {
                this.events[name].remove(callback);
            }
        };
        Events.prototype.emit = function (name, data) {
            if (this.events[name]) {
                this.events[name].emit(data);
            }
        };
        return Events;
    })();
    acid.Events = Events;
})(acid || (acid = {}));
var acid;
(function (acid) {
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
    acid.Task = Task;
})(acid || (acid = {}));
var acid;
(function (acid) {
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
    acid.Queue = Queue;
})(acid || (acid = {}));
var acid;
(function (acid) {
    var loop;
    (function (loop) {
        var running = false;
        var update_handlers = [];
        var render_handlers = [];
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
                            elapsed: delta,
                            runningTime: elapsed
                        });
                    });
                    render_handlers.forEach(function (handler) {
                        var now = new Date();
                        var delta = now.getTime() - handler.last.getTime();
                        var elapsed = now.getTime() - handler.started.getTime();
                        handler.last = now;
                        handler.callback({
                            elapsed: delta,
                            runningTime: elapsed
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
    })(loop = acid.loop || (acid.loop = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
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
})(acid || (acid = {}));
var acid;
(function (acid) {
    var pending = null;
    var descriptors = {};
    var cache = {};
    var queue = new acid.Queue(1);
    function request(name) {
        return new acid.Task(function (resolve, reject) {
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
        return new acid.Task(function (resolve, reject) {
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
        return new acid.Task(function (resolve, reject) {
            acid.Task.all(descriptor.names.map(load)).then(function (descriptors) {
                acid.Task.all(descriptors.map(boot)).then(function (exports) {
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
    acid.define = define;
    function require(names, callback) {
        return boot({
            name: undefined,
            names: names,
            callback: callback
        });
    }
    acid.require = require;
})(acid || (acid = {}));
var acid;
(function (acid) {
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
                acid.loop.update(function () {
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
    })(input = acid.input || (acid.input = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var animation;
    (function (animation) {
        function lerp(src, dst, amount) {
            var delta = dst - src;
            return src + (delta * amount);
        }
        animation.lerp = lerp;
        function lerp2(src, dst, amount) {
            var delta = new THREE.Vector2(dst.x - src.x, dst.y - src.y);
            return new THREE.Vector3(src.x + (delta.x * amount), src.y + (delta.y * amount));
        }
        animation.lerp2 = lerp2;
        function lerp3(src, dst, amount) {
            var delta = new THREE.Vector3(dst.x - src.x, dst.y - src.y, dst.z - src.z);
            if (amount == NaN) {
                throw Error("ok");
            }
            return new THREE.Vector3(src.x + (delta.x * amount), src.y + (delta.y * amount), src.z + (delta.z * amount));
        }
        animation.lerp3 = lerp3;
    })(animation = acid.animation || (acid.animation = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
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
            Animation.prototype.add = function (frame) {
                this.frames.push(frame);
                this.frames = this.frames.sort(function (a, b) {
                    if (a.time > b.time)
                        return 1;
                    if (a.time < b.time)
                        return -1;
                    return 0;
                });
            };
            Animation.prototype.get = function (millisecond, repeat) {
                if (this.frames.length == 0)
                    throw Error("unable to get with empty frames");
                if (this.frames.length == 1)
                    return this.frames[0].value;
                repeat = repeat || false;
                var first = this.frames[0];
                var last = this.frames[this.frames.length - 1];
                if (repeat)
                    millisecond = millisecond % last.time;
                if (millisecond <= first.time) {
                    return first.value;
                }
                if (millisecond >= last.time) {
                    return last.value;
                }
                var src = null;
                var dst = null;
                for (var i = (this.frames.length - 1); i >= 0; i--) {
                    if (millisecond >= this.frames[i].time) {
                        src = this.frames[i];
                        if (i < this.frames.length - 1)
                            dst = this.frames[i + 1];
                        else
                            src = this.frames[i];
                        break;
                    }
                }
                var delta_0 = dst.time - src.time;
                var delta_1 = dst.time - millisecond;
                var amount = (delta_1 != 0.0) ? delta_1 / delta_0 : 0.0;
                amount = -amount + 1.0;
                return this.interpolation(src.value, dst.value, amount);
            };
            return Animation;
        })();
        animation.Animation = Animation;
    })(animation = acid.animation || (acid.animation = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var math;
        (function (math) {
            function createReflectionMatrix(plane) {
                var n = plane.normalize();
                var m = new THREE.Matrix4();
                return m.set(1.0 - 2.0 * n.normal.x * n.normal.x, 2.0 * n.normal.x * n.normal.y, 2.0 * n.normal.x * n.normal.z, 0.0, -2.0 * n.normal.x * n.normal.y, 1.0 - 2.0 * n.normal.y * n.normal.y, -2.0 * n.normal.y * n.normal.z, 0.0, -2.0 * n.normal.z * n.normal.x, -2.0 * n.normal.z * n.normal.y, 1.0 - 2.0 * n.normal.z * n.normal.z, 0.0, -2.0 * n.constant * n.normal.x, -2.0 * n.constant * n.normal.y, -2.0 * n.constant * n.normal.z, 1.0);
            }
            math.createReflectionMatrix = createReflectionMatrix;
        })(math = graphics.math || (graphics.math = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var materials;
        (function (materials) {
            var ReflectMaterial = (function (_super) {
                __extends(ReflectMaterial, _super);
                function ReflectMaterial(options) {
                    _super.call(this, {});
                    this.options = options;
                    this.uniforms.reflection_map = {
                        type: "t",
                        value: options.reflection_map
                    };
                    this.uniforms.map = {
                        type: "t",
                        value: options.map
                    };
                    this.uniforms.roughness = {
                        type: "f",
                        value: options.roughness || 0
                    };
                    this.uniforms.reflect = {
                        type: "f",
                        value: options.reflect || 0.5
                    };
                    this.vertexShader = "\n\t\t\tvarying vec4 clipspace;\n\t\t\tvarying vec2 texcoord;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tclipspace = projectionMatrix * \n\t\t\t\t\tmodelViewMatrix * vec4(\n\t\t\t\t\tposition.x,\n\t\t\t\t\tposition.y, \n\t\t\t\t\tposition.z,  \n\t\t\t\t\t1.0);\n\t\t\t\ttexcoord = uv;\n\t\t\t\tgl_Position = clipspace;\n\t\t\t}";
                    this.fragmentShader = "\n\t\t\tvarying vec4       clipspace;\n\t\t\tvarying vec2       texcoord;\n\t\t\tuniform sampler2D  reflection_map;\n\t\t\tuniform sampler2D  map;\n\t\t\tuniform float      roughness;\n\t\t\tuniform float      reflect;\n\t\t\t\n\t\t\tvec4 sample_map() {\n\t\t\t\treturn texture2D(map, texcoord);\n\t\t\t}\n\t\t\t\t\n\t\t\tvec4 sample_reflection_map() {\n\t\t\t\tvec3 ndc = clipspace.xyz / clipspace.w;\n\t\t\t\tvec2 reflection_uv = ndc.xy * 0.5 + 0.5;\n\t\t\t\tvec4 accumulator = vec4(0.0);\n\t\t\t\tif(roughness > 0.0) {\n\t\t\t\t\tvec2  kernel[14];\n\t\t\t\t\tkernel[ 0] = reflection_uv + vec2(0.0, -0.028) * roughness;\n\t\t\t\t\tkernel[ 1] = reflection_uv + vec2(0.0, -0.024) * roughness;\n\t\t\t\t\tkernel[ 2] = reflection_uv + vec2(0.0, -0.020) * roughness;\n\t\t\t\t\tkernel[ 3] = reflection_uv + vec2(0.0, -0.016) * roughness;\n\t\t\t\t\tkernel[ 4] = reflection_uv + vec2(0.0, -0.012) * roughness;\n\t\t\t\t\tkernel[ 5] = reflection_uv + vec2(0.0, -0.008) * roughness;\n\t\t\t\t\tkernel[ 6] = reflection_uv + vec2(0.0, -0.004) * roughness;\n\t\t\t\t\tkernel[ 7] = reflection_uv + vec2(0.0,  0.004) * roughness;\n\t\t\t\t\tkernel[ 8] = reflection_uv + vec2(0.0,  0.008) * roughness;\n\t\t\t\t\tkernel[ 9] = reflection_uv + vec2(0.0,  0.012) * roughness;\n\t\t\t\t\tkernel[10] = reflection_uv + vec2(0.0,  0.016) * roughness;\n\t\t\t\t\tkernel[11] = reflection_uv + vec2(0.0,  0.020) * roughness;\n\t\t\t\t\tkernel[12] = reflection_uv + vec2(0.0,  0.024) * roughness;\n\t\t\t\t\tkernel[13] = reflection_uv + vec2(0.0,  0.028) * roughness;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 0])*0.0044299121055113265;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 1])*0.00895781211794;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 2])*0.0215963866053;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 3])*0.0443683338718;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 4])*0.0776744219933;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 5])*0.115876621105;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 6])*0.147308056121;\n\t\t\t\t\taccumulator += texture2D(reflection_map, reflection_uv    )*0.159576912161;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 7])*0.147308056121;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 8])*0.115876621105;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[ 9])*0.0776744219933;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[10])*0.0443683338718;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[11])*0.0215963866053;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[12])*0.00895781211794;\n\t\t\t\t\taccumulator += texture2D(reflection_map, kernel[13])*0.0044299121055113265;\t\n\t\t\t\t} else {\n\t\t\t\t\taccumulator += texture2D(reflection_map, reflection_uv);\n\t\t\t\t}\n\t\t\t\treturn accumulator;\n\t\t\t}\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 _map        = sample_map();\n\t\t\t\tvec4 _reflection = sample_reflection_map();\n\t\t\t\tgl_FragColor     = _map + (_reflection * reflect);\n\t\t\t}";
                }
                return ReflectMaterial;
            })(THREE.ShaderMaterial);
            materials.ReflectMaterial = ReflectMaterial;
        })(materials = graphics.materials || (graphics.materials = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var targets;
        (function (targets) {
            var Target = (function (_super) {
                __extends(Target, _super);
                function Target(width, height, options) {
                    _super.call(this, width, height, options);
                }
                return Target;
            })(THREE.WebGLRenderTarget);
            targets.Target = Target;
        })(targets = graphics.targets || (graphics.targets = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var effects;
        (function (effects) {
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
                        vertexShader: "\n\t\t\t\tvarying vec2  texcoord;\n\t\t\t\tuniform vec2  resolution;\n\t\t\t\tvoid main() {\n\t\t\t\t\ttexcoord = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * \n\t\t\t\t\t\tvec4(position.x * resolution.x,\n\t\t\t\t\t\tposition.y * resolution.y,\n\t\t\t\t\t\tposition.z,  1.0 );\n\t\t\t\t}"
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
            effects.Effect = Effect;
        })(effects = graphics.effects || (graphics.effects = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var canvas;
        (function (canvas) {
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
            canvas.Canvas = Canvas;
        })(canvas = graphics.canvas || (graphics.canvas = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var canvas;
        (function (canvas) {
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
                    this.canvas = new acid.graphics.canvas.Canvas({
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
            canvas.Console = Console;
        })(canvas = graphics.canvas || (graphics.canvas = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var assets;
        (function (assets) {
            var msgpack;
            (function (msgpack) {
                function inspect(buffer) {
                    if (buffer === undefined)
                        return "undefined";
                    var view;
                    var type;
                    if (buffer instanceof ArrayBuffer) {
                        type = "ArrayBuffer";
                        view = new DataView(buffer);
                    }
                    else if (buffer instanceof DataView) {
                        type = "DataView";
                        view = buffer;
                    }
                    if (!view)
                        return JSON.stringify(buffer);
                    var bytes = [];
                    for (var i = 0; i < buffer.byteLength; i++) {
                        if (i > 20) {
                            bytes.push("...");
                            break;
                        }
                        var byte = view.getUint8(i).toString(16);
                        if (byte.length === 1)
                            byte = "0" + byte;
                        bytes.push(byte);
                    }
                    return "<" + type + " " + bytes.join(" ") + ">";
                }
                msgpack.inspect = inspect;
                function utf8Write(view, offset, string) {
                    var byteLength = view.byteLength;
                    for (var i = 0, l = string.length; i < l; i++) {
                        var codePoint = string.charCodeAt(i);
                        if (codePoint < 0x80) {
                            view.setUint8(offset++, codePoint >>> 0 & 0x7f | 0x00);
                            continue;
                        }
                        if (codePoint < 0x800) {
                            view.setUint8(offset++, codePoint >>> 6 & 0x1f | 0xc0);
                            view.setUint8(offset++, codePoint >>> 0 & 0x3f | 0x80);
                            continue;
                        }
                        if (codePoint < 0x10000) {
                            view.setUint8(offset++, codePoint >>> 12 & 0x0f | 0xe0);
                            view.setUint8(offset++, codePoint >>> 6 & 0x3f | 0x80);
                            view.setUint8(offset++, codePoint >>> 0 & 0x3f | 0x80);
                            continue;
                        }
                        if (codePoint < 0x110000) {
                            view.setUint8(offset++, codePoint >>> 18 & 0x07 | 0xf0);
                            view.setUint8(offset++, codePoint >>> 12 & 0x3f | 0x80);
                            view.setUint8(offset++, codePoint >>> 6 & 0x3f | 0x80);
                            view.setUint8(offset++, codePoint >>> 0 & 0x3f | 0x80);
                            continue;
                        }
                        throw new Error("bad codepoint " + codePoint);
                    }
                }
                function utf8Read(view, offset, length) {
                    var string = "";
                    for (var i = offset, end = offset + length; i < end; i++) {
                        var byte = view.getUint8(i);
                        if ((byte & 0x80) === 0x00) {
                            string += String.fromCharCode(byte);
                            continue;
                        }
                        if ((byte & 0xe0) === 0xc0) {
                            string += String.fromCharCode(((byte & 0x0f) << 6) |
                                (view.getUint8(++i) & 0x3f));
                            continue;
                        }
                        if ((byte & 0xf0) === 0xe0) {
                            string += String.fromCharCode(((byte & 0x0f) << 12) |
                                ((view.getUint8(++i) & 0x3f) << 6) |
                                ((view.getUint8(++i) & 0x3f) << 0));
                            continue;
                        }
                        if ((byte & 0xf8) === 0xf0) {
                            string += String.fromCharCode(((byte & 0x07) << 18) |
                                ((view.getUint8(++i) & 0x3f) << 12) |
                                ((view.getUint8(++i) & 0x3f) << 6) |
                                ((view.getUint8(++i) & 0x3f) << 0));
                            continue;
                        }
                        throw new Error("Invalid byte " + byte.toString(16));
                    }
                    return string;
                }
                function utf8ByteCount(string) {
                    var count = 0;
                    for (var i = 0, l = string.length; i < l; i++) {
                        var codePoint = string.charCodeAt(i);
                        if (codePoint < 0x80) {
                            count += 1;
                            continue;
                        }
                        if (codePoint < 0x800) {
                            count += 2;
                            continue;
                        }
                        if (codePoint < 0x10000) {
                            count += 3;
                            continue;
                        }
                        if (codePoint < 0x110000) {
                            count += 4;
                            continue;
                        }
                        throw new Error("bad codepoint " + codePoint);
                    }
                    return count;
                }
                var Decoder = (function () {
                    function Decoder(view, offset) {
                        this.view = view;
                        this.offset = offset;
                        this.offset = offset || 0;
                        this.view = view;
                    }
                    Decoder.prototype.map = function (length) {
                        var value = {};
                        for (var i = 0; i < length; i++) {
                            var key = this.parse();
                            value[key] = this.parse();
                        }
                        return value;
                    };
                    Decoder.prototype.bin = function (length) {
                        var value = new ArrayBuffer(length);
                        (new Uint8Array(value)).set(new Uint8Array(this.view.buffer, this.offset, length), 0);
                        this.offset += length;
                        return value;
                    };
                    Decoder.prototype.str = function (length) {
                        var value = utf8Read(this.view, this.offset, length);
                        this.offset += length;
                        return value;
                    };
                    Decoder.prototype.array = function (length) {
                        var value = new Array(length);
                        for (var i = 0; i < length; i++) {
                            value[i] = this.parse();
                        }
                        return value;
                    };
                    Decoder.prototype.parse = function () {
                        var type = this.view.getUint8(this.offset);
                        var value, length;
                        if ((type & 0xe0) === 0xa0) {
                            length = type & 0x1f;
                            this.offset++;
                            return this.str(length);
                        }
                        if ((type & 0xf0) === 0x80) {
                            length = type & 0x0f;
                            this.offset++;
                            return this.map(length);
                        }
                        if ((type & 0xf0) === 0x90) {
                            length = type & 0x0f;
                            this.offset++;
                            return this.array(length);
                        }
                        if ((type & 0x80) === 0x00) {
                            this.offset++;
                            return type;
                        }
                        if ((type & 0xe0) === 0xe0) {
                            value = this.view.getInt8(this.offset);
                            this.offset++;
                            return value;
                        }
                        if (type === 0xd4 && this.view.getUint8(this.offset + 1) === 0x00) {
                            this.offset += 3;
                            return undefined;
                        }
                        switch (type) {
                            case 0xd9:
                                length = this.view.getUint8(this.offset + 1);
                                this.offset += 2;
                                return this.str(length);
                            case 0xda:
                                length = this.view.getUint16(this.offset + 1);
                                this.offset += 3;
                                return this.str(length);
                            case 0xdb:
                                length = this.view.getUint32(this.offset + 1);
                                this.offset += 5;
                                return this.str(length);
                            case 0xc4:
                                length = this.view.getUint8(this.offset + 1);
                                this.offset += 2;
                                return this.bin(length);
                            case 0xc5:
                                length = this.view.getUint16(this.offset + 1);
                                this.offset += 3;
                                return this.bin(length);
                            case 0xc6:
                                length = this.view.getUint32(this.offset + 1);
                                this.offset += 5;
                                return this.bin(length);
                            case 0xc0:
                                this.offset++;
                                return null;
                            case 0xc2:
                                this.offset++;
                                return false;
                            case 0xc3:
                                this.offset++;
                                return true;
                            case 0xcc:
                                value = this.view.getUint8(this.offset + 1);
                                this.offset += 2;
                                return value;
                            case 0xcd:
                                value = this.view.getUint16(this.offset + 1);
                                this.offset += 3;
                                return value;
                            case 0xce:
                                value = this.view.getUint32(this.offset + 1);
                                this.offset += 5;
                                return value;
                            case 0xcf:
                                var high = this.view.getUint32(this.offset + 1);
                                var low = this.view.getUint32(this.offset + 5);
                                value = high * 0x100000000 + low;
                                this.offset += 9;
                                return value;
                            case 0xd0:
                                value = this.view.getInt8(this.offset + 1);
                                this.offset += 2;
                                return value;
                            case 0xd1:
                                value = this.view.getInt16(this.offset + 1);
                                this.offset += 3;
                                return value;
                            case 0xd2:
                                value = this.view.getInt32(this.offset + 1);
                                this.offset += 5;
                                return value;
                            case 0xd3:
                                var high = this.view.getInt32(this.offset + 1);
                                var low = this.view.getUint32(this.offset + 5);
                                value = high * 0x100000000 + low;
                                this.offset += 9;
                                return value;
                            case 0xde:
                                length = this.view.getUint16(this.offset + 1);
                                this.offset += 3;
                                return this.map(length);
                            case 0xdf:
                                length = this.view.getUint32(this.offset + 1);
                                this.offset += 5;
                                return this.map(length);
                            case 0xdc:
                                length = this.view.getUint16(this.offset + 1);
                                this.offset += 3;
                                return this.array(length);
                            case 0xdd:
                                length = this.view.getUint32(this.offset + 1);
                                this.offset += 5;
                                return this.array(length);
                            case 0xca:
                                value = this.view.getFloat32(this.offset + 1);
                                this.offset += 5;
                                return value;
                            case 0xcb:
                                value = this.view.getFloat64(this.offset + 1);
                                this.offset += 9;
                                return value;
                        }
                        throw new Error("Unknown type 0x" + type.toString(16));
                    };
                    return Decoder;
                })();
                function _encode(value, view, offset) {
                    var type = typeof value;
                    if (type === "string") {
                        var length = utf8ByteCount(value);
                        if (length < 0x20) {
                            view.setUint8(offset, length | 0xa0);
                            utf8Write(view, offset + 1, value);
                            return 1 + length;
                        }
                        if (length < 0x100) {
                            view.setUint8(offset, 0xd9);
                            view.setUint8(offset + 1, length);
                            utf8Write(view, offset + 2, value);
                            return 2 + length;
                        }
                        if (length < 0x10000) {
                            view.setUint8(offset, 0xda);
                            view.setUint16(offset + 1, length);
                            utf8Write(view, offset + 3, value);
                            return 3 + length;
                        }
                        if (length < 0x100000000) {
                            view.setUint8(offset, 0xdb);
                            view.setUint32(offset + 1, length);
                            utf8Write(view, offset + 5, value);
                            return 5 + length;
                        }
                    }
                    if (value instanceof ArrayBuffer) {
                        var length = value.byteLength;
                        if (length < 0x100) {
                            view.setUint8(offset, 0xc4);
                            view.setUint8(offset + 1, length);
                            (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 2);
                            return 2 + length;
                        }
                        if (length < 0x10000) {
                            view.setUint8(offset, 0xc5);
                            view.setUint16(offset + 1, length);
                            (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 3);
                            return 3 + length;
                        }
                        if (length < 0x100000000) {
                            view.setUint8(offset, 0xc6);
                            view.setUint32(offset + 1, length);
                            (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 5);
                            return 5 + length;
                        }
                    }
                    if (type === "number") {
                        if ((value << 0) !== value) {
                            view.setUint8(offset, 0xcb);
                            view.setFloat64(offset + 1, value);
                            return 9;
                        }
                        if (value >= 0) {
                            if (value < 0x80) {
                                view.setUint8(offset, value);
                                return 1;
                            }
                            if (value < 0x100) {
                                view.setUint8(offset, 0xcc);
                                view.setUint8(offset + 1, value);
                                return 2;
                            }
                            if (value < 0x10000) {
                                view.setUint8(offset, 0xcd);
                                view.setUint16(offset + 1, value);
                                return 3;
                            }
                            if (value < 0x100000000) {
                                view.setUint8(offset, 0xce);
                                view.setUint32(offset + 1, value);
                                return 5;
                            }
                            throw new Error("Number too big 0x" + value.toString(16));
                        }
                        if (value >= -0x20) {
                            view.setInt8(offset, value);
                            return 1;
                        }
                        if (value >= -0x80) {
                            view.setUint8(offset, 0xd0);
                            view.setInt8(offset + 1, value);
                            return 2;
                        }
                        if (value >= -0x8000) {
                            view.setUint8(offset, 0xd1);
                            view.setInt16(offset + 1, value);
                            return 3;
                        }
                        if (value >= -0x80000000) {
                            view.setUint8(offset, 0xd2);
                            view.setInt32(offset + 1, value);
                            return 5;
                        }
                        throw new Error("Number too small -0x" + (-value).toString(16).substr(1));
                    }
                    if (type === "undefined") {
                        view.setUint8(offset, 0xd4);
                        view.setUint8(offset + 1, 0);
                        view.setUint8(offset + 2, 0);
                        return 3;
                    }
                    if (value === null) {
                        view.setUint8(offset, 0xc0);
                        return 1;
                    }
                    if (type === "boolean") {
                        view.setUint8(offset, value ? 0xc3 : 0xc2);
                        return 1;
                    }
                    if (type === "object") {
                        var length, size = 0;
                        var isArray = Array.isArray(value);
                        if (isArray) {
                            length = value.length;
                        }
                        else {
                            var keys = Object.keys(value);
                            length = keys.length;
                        }
                        var size;
                        if (length < 0x10) {
                            view.setUint8(offset, length | (isArray ? 0x90 : 0x80));
                            size = 1;
                        }
                        else if (length < 0x10000) {
                            view.setUint8(offset, isArray ? 0xdc : 0xde);
                            view.setUint16(offset + 1, length);
                            size = 3;
                        }
                        else if (length < 0x100000000) {
                            view.setUint8(offset, isArray ? 0xdd : 0xdf);
                            view.setUint32(offset + 1, length);
                            size = 5;
                        }
                        if (isArray) {
                            for (var i = 0; i < length; i++) {
                                size += _encode(value[i], view, offset + size);
                            }
                        }
                        else {
                            for (var i = 0; i < length; i++) {
                                var key = keys[i];
                                size += _encode(key, view, offset + size);
                                size += _encode(value[key], view, offset + size);
                            }
                        }
                        return size;
                    }
                    throw new Error("Unknown type " + type);
                }
                function encodedSize(value) {
                    var type = typeof value;
                    if (type === "string") {
                        var length = utf8ByteCount(value);
                        if (length < 0x20) {
                            return 1 + length;
                        }
                        if (length < 0x100) {
                            return 2 + length;
                        }
                        if (length < 0x10000) {
                            return 3 + length;
                        }
                        if (length < 0x100000000) {
                            return 5 + length;
                        }
                    }
                    if (value instanceof ArrayBuffer) {
                        var length = value.byteLength;
                        if (length < 0x100) {
                            return 2 + length;
                        }
                        if (length < 0x10000) {
                            return 3 + length;
                        }
                        if (length < 0x100000000) {
                            return 5 + length;
                        }
                    }
                    if (type === "number") {
                        if (value << 0 !== value)
                            return 9;
                        if (value >= 0) {
                            if (value < 0x80)
                                return 1;
                            if (value < 0x100)
                                return 2;
                            if (value < 0x10000)
                                return 3;
                            if (value < 0x100000000)
                                return 5;
                            if (value < 0x10000000000000000)
                                return 9;
                            throw new Error("Number too big 0x" + value.toString(16));
                        }
                        if (value >= -0x20)
                            return 1;
                        if (value >= -0x80)
                            return 2;
                        if (value >= -0x8000)
                            return 3;
                        if (value >= -0x80000000)
                            return 5;
                        if (value >= -0x8000000000000000)
                            return 9;
                        throw new Error("Number too small -0x" + value.toString(16).substr(1));
                    }
                    if (type === "undefined")
                        return 3;
                    if (type === "boolean" || value === null)
                        return 1;
                    if (type === "object") {
                        var length, size = 0;
                        if (Array.isArray(value)) {
                            length = value.length;
                            for (var i = 0; i < length; i++) {
                                size += encodedSize(value[i]);
                            }
                        }
                        else {
                            var keys = Object.keys(value);
                            length = keys.length;
                            for (var i = 0; i < length; i++) {
                                var key = keys[i];
                                size += encodedSize(key) + encodedSize(value[key]);
                            }
                        }
                        if (length < 0x10) {
                            return 1 + size;
                        }
                        if (length < 0x10000) {
                            return 3 + size;
                        }
                        if (length < 0x100000000) {
                            return 5 + size;
                        }
                        throw new Error("Array or object too long 0x" + length.toString(16));
                    }
                    throw new Error("Unknown type " + type);
                }
                function encode(value) {
                    var buffer = new ArrayBuffer(encodedSize(value));
                    var view = new DataView(buffer);
                    _encode(value, view, 0);
                    return buffer;
                }
                msgpack.encode = encode;
                ;
                function decode(buffer) {
                    var view = new DataView(buffer);
                    var decoder = new Decoder(view);
                    var value = decoder.parse();
                    if (decoder.offset !== buffer.byteLength)
                        throw new Error((buffer.byteLength - decoder.offset) + " trailing bytes");
                    return value;
                }
                msgpack.decode = decode;
            })(msgpack = assets.msgpack || (assets.msgpack = {}));
        })(assets = graphics.assets || (graphics.assets = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var assets;
        (function (assets) {
            function load_json(url) {
                return new acid.Task(function (resolve, reject) {
                    var loader = new THREE.JSONLoader();
                    loader.load(url, function (geometry, materials) {
                        resolve({
                            geometry: geometry,
                            materials: materials
                        });
                    });
                });
            }
            function load_scene(url) {
                return new acid.Task(function (resolve, reject) {
                    var loader = new THREE.ObjectLoader();
                    loader.load(url, function (scene) {
                        resolve(scene);
                    });
                });
            }
            function load_msgpack(url) {
                return new acid.Task(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.addEventListener("load", function (e) {
                        var decoded = assets.msgpack.decode(xhr.response);
                        var loader = new THREE.ObjectLoader();
                        var scene = loader.parse(decoded);
                        resolve(scene);
                    }, false);
                    xhr.send();
                });
            }
            function load_texture(url) {
                return new acid.Task(function (resolve, reject) {
                    var loader = new THREE.TextureLoader();
                    loader.load(url, function (texture) {
                        resolve(texture);
                    });
                });
            }
            function load(type, urls) {
                if (typeof urls === "string") {
                    switch (type) {
                        case "texture": return load_texture(urls);
                        case "json": return load_json(urls);
                        case "scene": return load_scene(urls);
                        case "msgpack": return load_msgpack(urls);
                        default: return new acid.Task(function (resolve, reject) {
                            return reject('unknown type');
                        });
                    }
                }
                else {
                    switch (type) {
                        case "texture": return acid.Task.all(urls.map(load_texture));
                        case "json": return acid.Task.all(urls.map(load_json));
                        case "scene": return acid.Task.all(urls.map(load_scene));
                        case "msgpack": return acid.Task.all(urls.map(load_msgpack));
                        default: return new acid.Task(function (resolve, reject) {
                            return reject('unknown type');
                        });
                    }
                }
            }
            assets.load = load;
        })(assets = graphics.assets || (graphics.assets = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        var cameras;
        (function (cameras) {
            function reflect(camera, plane) {
                var reflect = camera.clone();
                reflect.matrixAutoUpdate = false;
                reflect.matrix.copy(acid.graphics.math.createReflectionMatrix(plane));
                reflect.matrix.multiply(camera.matrix);
                reflect.updateProjectionMatrix();
                reflect.updateMatrixWorld(true);
                return reflect;
            }
            cameras.reflect = reflect;
        })(cameras = graphics.cameras || (graphics.cameras = {}));
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
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
                acid.loop.update(function () {
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
        })(acid.Events);
        graphics.Element = Element;
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
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
                    vertexShader: "\n\t\t\t\tvarying vec2  texcoord;\n\t\t\t\tuniform vec2  scale;\n\t\t\t\tvoid main() {\n\t\t\t\t\ttexcoord = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * \n\t\t\t\t\t\tmodelViewMatrix * vec4(\n\t\t\t\t\t\tposition.x * scale.x,\n\t\t\t\t\t\tposition.y * scale.y, \n\t\t\t\t\t\tposition.z,  1.0 );\n\t\t\t\t}",
                    fragmentShader: "\n\t\t\t\tvarying  vec2 \ttexcoord;\n\t\t\t\tuniform sampler2D map;\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_FragColor = texture2D( map, texcoord );\n\t\t\t\t}"
                });
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(1, 1, 1, 1, -10000, 10000);
                this.plane = new THREE.PlaneBufferGeometry(1, 1);
                this.mesh = new THREE.Mesh(this.plane, this.material);
                this.mesh.position.z = -1;
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
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var graphics;
    (function (graphics) {
        function app(elementid, callback) {
            acid.ready(function () {
                var domelement = document.getElementById(elementid);
                var element = new acid.graphics.Element(domelement);
                var renderer = new acid.graphics.Renderer(element);
                acid.loop.start();
                callback({
                    element: element,
                    renderer: renderer,
                });
            });
        }
        graphics.app = app;
    })(graphics = acid.graphics || (acid.graphics = {}));
})(acid || (acid = {}));
var acid;
(function (acid) {
    var loaded = false;
    window.addEventListener("load", function () { return loaded = true; });
    function ready(callback) {
        if (!loaded) {
            window.addEventListener("load", callback, false);
        }
        else {
            callback();
        }
    }
    acid.ready = ready;
})(acid || (acid = {}));
