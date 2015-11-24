/*--------------------------------------------------------------------------

mxdi-js - multimedia web stuff

The MIT License (MIT)

Copyright (c) 2015 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

/// <reference path="../loop/index.ts" />

module mxdi.input.gamepad {
	
    /**
     * gamepad tracking list
     */
	var gamepads = [];
    
    /**
     * gamepad state: (supports only a single controller)
     */    
    export var enabled = false;
    export var buttons = { a: 0.0, b: 0.0, x: 0.0, y: 0.0, start: 0.0, select: 0.0 };
    export var dpad    = { up   : 0.0, down: 0.0, left: 0.0, right: 0.0 };
    export var sticks  = {
        left:  { x: 0.0, y: 0.0, button: 0.0 },
        right: { x: 0.0, y: 0.0, button: 0.0 }
    };
    export var shoulders = {
        left:  { top: 0.0, bottom: 0.0 },
        right: { top: 0.0, bottom: 0.0 }
    };    
	
	/**
	* connect(gamepad: Gamepad): pushes new gamepad on gamepad tracking list.
	* @param gamepad {Gamepad} - the gamepad to connect.
	* @returns {void}
	*/
	var connect = gamepad => gamepads.push(gamepad);
    
	/**
	* disconnect(gamepad: Gamepad): removes gamepad on gamepad tracking list.
	* @param gamepad {Gamepad} - the gamepad to disconnect.
	* @returns {void}
	*/
	var disconnect = gamepad => 
		gamepads = gamepads.filter(item => item.index != gamepad.index);
	
	/**
	* poll(): polls trackings list for changes.
	* @returns {void}	 
	*/
	var poll = () => {
		var _navigator:any = navigator;
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
	}
	
    /**
    * process_button(): processes a button input value.
    * @returns {number|boolean} the value read from this button.
    */
    var process_button = button =>
        (typeof (button) == 'object') ? button.value : button
    	
    
    /**
     * setup gamepad polling.
     */
    var _navigator:any = navigator;
    if (_navigator.getGamepads || 
        !!_navigator.webkitGetGamepads || 
        !!_navigator.webkitGamepads) {
        if ('ongamepadconnected' in window) {
            window.addEventListener('gamepadconnected', event => connect((<any>event).gamepad), false);
            window.addEventListener('gamepaddisconnected', event => disconnect((<any>event).gamepad), false);
        }
        else {
            setInterval(() => poll());
        }
    }
    
    /**
     * initialize loop.
     */
    if (_navigator.getGamepads ||
        !!_navigator.webkitGetGamepads ||
        !!_navigator.webkitGamepads) {
        mxdi.loop.update(() => {
            enabled = gamepads.length > 0;
            gamepads.forEach(gamepad => {
                sticks.left.x          = gamepad.axes[0];
                sticks.left.y          = gamepad.axes[1];
                sticks.right.x         = gamepad.axes[2];
                sticks.right.y         = gamepad.axes[3];
                buttons.a              = process_button(gamepad.buttons[0]);
                buttons.b              = process_button(gamepad.buttons[1]);
                buttons.x              = process_button(gamepad.buttons[2]);
                buttons.y              = process_button(gamepad.buttons[3]);
                shoulders.left.top     = process_button(gamepad.buttons[4]);
                shoulders.left.bottom  = process_button(gamepad.buttons[6]);
                shoulders.right.top    = process_button(gamepad.buttons[5]);
                shoulders.right.bottom = process_button(gamepad.buttons[7]);
                buttons.select         = process_button(gamepad.buttons[8]);
                buttons.start          = process_button(gamepad.buttons[9]);
                sticks.left.button     = process_button(gamepad.buttons[10]);
                sticks.right.button    = process_button(gamepad.buttons[11]);
                dpad.up                = process_button(gamepad.buttons[12]);
                dpad.down              = process_button(gamepad.buttons[13]);
                dpad.left              = process_button(gamepad.buttons[14]);
                dpad.right             = process_button(gamepad.buttons[15]);
            })
        })
    }

}