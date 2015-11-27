/// <reference path="../src/typings/threejs/three.d.ts" />
declare module mxdi {
    class EventEmitter {
        private events;
        once(name: string, callback: (data: any) => void): void;
        on(name: string, callback: (data: any) => void): void;
        remove(name: string, callback: (data: any) => void): void;
        emit(name: string, data: any): void;
    }
}
declare module mxdi {
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
declare module mxdi {
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
declare module mxdi.loop {
    interface LoopStatus {
        delta: number;
        runtime: number;
    }
    function start(): void;
    function stop(): void;
    function update(callback: (status: LoopStatus) => void): void;
    function render(callback: (status: LoopStatus) => void): void;
}
declare module mxdi {
}
declare module mxdi {
    function define(name: string, names: string[], callback: (...args: any[]) => any): void;
    function define(names: string[], callback: (...args: any[]) => any): void;
    function require(names: string[], callback: (...args: any[]) => any): Task<any>;
}
declare module mxdi.input.gamepad {
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
declare module mxdi.animation {
    function lerp(src: number, dst: number, amount: number): number;
}
declare module mxdi.animation {
    interface Frame<T> {
        time: number;
        value: T;
    }
    class Animation<T> {
        private frames;
        private interpolation;
        constructor(frames: Frame<T>[], interpolation: (src: T, dst: T, amount: number) => T);
        get(millisecond: number, repeat: boolean): T;
    }
}
declare module mxdi.graphics {
    class Element extends mxdi.EventEmitter {
        private element;
        width: number;
        height: number;
        constructor(element: HTMLElement);
        appendChild(element: HTMLElement): void;
    }
}
declare module mxdi.graphics {
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
declare module mxdi.graphics {
    class Renderer extends THREE.WebGLRenderer {
        private element;
        private material;
        private scene;
        private camera;
        private plane;
        private mesh;
        constructor(element: mxdi.graphics.Element);
        private initialize();
        output(texture: THREE.Texture | THREE.WebGLRenderTarget, crop: boolean): void;
    }
}
declare module mxdi.graphics {
    class Target extends THREE.WebGLRenderTarget {
        constructor(width: number, height: number, options?: THREE.WebGLRenderTargetOptions);
    }
}
declare module mxdi.graphics {
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
declare module mxdi.graphics {
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
declare module mxdi.graphics {
    function load(type: string, urls: string[]): mxdi.Task<any>;
}
declare module mxdi {
    interface App {
        element: mxdi.graphics.Element;
        renderer: mxdi.graphics.Renderer;
    }
    function app(elementid: string, callback: (app: App) => void): void;
}
