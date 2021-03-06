/// <reference path="../src/typings/threejs/three.d.ts" />
declare module acid {
    class Events {
        private events;
        once(name: string, callback: (data: any) => void): void;
        on(name: string, callback: (data: any) => void): void;
        remove(name: string, callback: (data: any) => void): void;
        emit(name: string, data: any): void;
    }
}
declare module acid {
    class Task<T extends any> {
        private state;
        private thens;
        private catches;
        private value;
        private error;
        constructor(resolver: (resolve: (value: T) => void, reject: (error: any) => void) => void);
        then(callback: (value: T) => void): Task<T>;
        catch(callback: (error: any) => void): Task<T>;
        private resolve(value);
        private reject(error);
        static all<T>(tasks: Task<T>[]): Task<T[]>;
    }
}
declare module acid {
    class Queue {
        private concurrency;
        private queue;
        private paused;
        private running;
        constructor(concurrency?: number);
        run(operation: (next: () => void) => void): void;
        private next();
    }
}
declare module acid.loop {
    interface LoopInfo {
        elapsed: number;
        runningTime: number;
    }
    function update(callback: (status: LoopInfo) => void): void;
    function render(callback: (status: LoopInfo) => void): void;
    function start(): void;
    function stop(): void;
}
declare module acid {
}
declare module acid {
    function define(name: string, names: string[], callback: (...args: any[]) => any): void;
    function define(names: string[], callback: (...args: any[]) => any): void;
    function require(names: string[], callback: (...args: any[]) => any): Task<any>;
}
declare module acid.input.gamepad {
    var enabled: boolean;
    var buttons: {
        a: number;
        b: number;
        x: number;
        y: number;
        start: number;
        select: number;
    };
    var dpad: {
        up: number;
        down: number;
        left: number;
        right: number;
    };
    var sticks: {
        left: {
            x: number;
            y: number;
            button: number;
        };
        right: {
            x: number;
            y: number;
            button: number;
        };
    };
    var shoulders: {
        left: {
            top: number;
            bottom: number;
        };
        right: {
            top: number;
            bottom: number;
        };
    };
}
declare module acid.animation {
    function lerp(src: number, dst: number, amount: number): number;
    function lerp2(src: THREE.Vector2, dst: THREE.Vector2, amount: number): THREE.Vector3;
    function lerp3(src: THREE.Vector3, dst: THREE.Vector3, amount: number): THREE.Vector3;
}
declare module acid.animation {
    interface Frame<T> {
        time: number;
        value: T;
    }
    class Animation<T> {
        private frames;
        private interpolation;
        constructor(frames: Frame<T>[], interpolation: (src: T, dst: T, amount: number) => T);
        add(frame: Frame<T>): void;
        get(millisecond: number, repeat: boolean): T;
    }
}
declare module acid.graphics.math {
    function createReflectionMatrix(plane: THREE.Plane): THREE.Matrix4;
}
declare module acid.graphics.materials {
    interface ReflectMaterialParamaters extends THREE.ShaderMaterialParameters {
        reflection_map?: THREE.Texture | THREE.WebGLRenderTarget;
        map?: THREE.Texture | THREE.WebGLRenderTarget;
        roughness?: number;
        reflect?: number;
    }
    class ReflectMaterial extends THREE.ShaderMaterial {
        private options;
        constructor(options?: ReflectMaterialParamaters);
    }
}
declare module acid.graphics.targets {
    class Target extends THREE.WebGLRenderTarget {
        constructor(width: number, height: number, options?: THREE.WebGLRenderTargetOptions);
    }
}
declare module acid.graphics.effects {
    class Effect {
        private material;
        private scene;
        private camera;
        private plane;
        private mesh;
        constructor(source_or_function: string | Function);
        render(renderer: THREE.WebGLRenderer, uniforms: any, target: THREE.WebGLRenderTarget): void;
        dispose(): void;
        private parse_to_string(string_or_func);
        private parse_uniforms(source);
        private prepare_effect(source);
    }
}
declare module acid.graphics.canvas {
    interface CanvasOptions {
        width: number;
        height: number;
    }
    class Canvas {
        private options;
        private _canvas;
        private _context;
        private _texture;
        constructor(options: CanvasOptions);
        context(): CanvasRenderingContext2D;
        texture(): THREE.Texture;
        dispose(): void;
    }
}
declare module acid.graphics.canvas {
    interface ConsoleOptions {
        width?: number;
        height?: number;
        color?: string;
        backgroundColor?: string;
        font?: string;
        fontsize?: number;
        lineheight?: number;
        buffersize?: number;
    }
    class Console {
        private options;
        private canvas;
        private buffer;
        private ratio;
        private devicePixelRatio;
        private backingStoreRatio;
        constructor(options: ConsoleOptions);
        private initialize();
        texture(): THREE.Texture;
        dispose(): void;
        clear(): void;
        log(message: string): void;
        private draw();
    }
}
declare module acid.graphics.assets.msgpack {
    function inspect(buffer: any): string;
    function encode(value: any): ArrayBuffer;
    function decode(buffer: any): any;
}
declare module acid.graphics.assets {
    function load(type: string, urls: string | string[]): acid.Task<any>;
}
declare module acid.graphics.cameras {
    function reflect(camera: THREE.PerspectiveCamera, plane: THREE.Plane): THREE.Camera;
}
declare module acid.graphics {
    class Element extends acid.Events {
        private element;
        width: number;
        height: number;
        constructor(element: HTMLElement);
        appendChild(element: HTMLElement): void;
    }
}
declare module acid.graphics {
    class Renderer extends THREE.WebGLRenderer {
        private element;
        private material;
        private scene;
        private camera;
        private plane;
        private mesh;
        constructor(element: acid.graphics.Element);
        private initialize();
        output(texture: THREE.Texture | THREE.WebGLRenderTarget, crop: boolean): void;
    }
}
declare module acid.graphics {
    interface IApp {
        element: acid.graphics.Element;
        renderer: acid.graphics.Renderer;
    }
    function app(elementid: string, callback: (app: IApp) => void): void;
}
declare module acid {
    function ready(callback: () => void): void;
}
