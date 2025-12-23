JL.webgl.init({
	attr : {
		variables : {
			default_background   : '_default',
			default_key_bindings : [ 'mouse', 'reset' ],
		},
	},
	controllers : {},
	hashlinks   : {},
	keyboard    : {
		bindings : {
			ttr : [
				{ name :  "LEFT ARROW", controllers : { ps4 : 'Square' }, down : function(){ JL.webgl.active_camera.target.tap(0); }, up : function(){ JL.webgl.active_camera.target.release(0); } },
				{ name :  "DOWN ARROW", controllers : { ps4 : 'X'      }, down : function(){ JL.webgl.active_camera.target.tap(1); }, up : function(){ JL.webgl.active_camera.target.release(1); } },
				{ name : "RIGHT ARROW", controllers : { ps4 : 'O'      }, down : function(){ JL.webgl.active_camera.target.tap(2); }, up : function(){ JL.webgl.active_camera.target.release(2); } },
			],
		},
	},
	mouse       : {
		events : {
			touch_start_1 : [{ fn : function( e, touch ){
				if( !JL.webgl.variables.throw_curr ){
					if( JL.webgl.active_camera.target.is_user ){
						JL.webgl.variables.throw_curr = { x : touch.screenX, y : touch.screenY, t : ( new Date() ).getTime() };

						JL.webgl.variables.throw_v = [];
					}
				}
			}, }],
			touch_move_1 : [{ fn : function( e, touch ){
				if( JL.webgl.variables.throw_curr ){
					JL.webgl.variables.throw_prev = JL.webgl.variables.throw_curr;
					JL.webgl.variables.throw_curr = { x : touch.screenX, y : touch.screenY, t : ( new Date() ).getTime() };

					var t_diff = JL.webgl.variables.throw_curr.t - JL.webgl.variables.throw_prev.t;

					JL.webgl.variables.throw_v.push({
						x : ( JL.webgl.variables.throw_prev.x - JL.webgl.variables.throw_curr.x ) / t_diff,
						y : ( JL.webgl.variables.throw_prev.y - JL.webgl.variables.throw_curr.y ) / t_diff,
					});
				}
			}, }],
			touch_end : [{ fn : function( e ){
				if( JL.webgl.variables.throw_prev ){
					var v_vals = JL.webgl.variables.throw_v.slice( -5 );

					var v_x = 0;
					var v_y = 0;
					for( var v of v_vals ){
						v_x += v.x;
						v_y += v.y;
					}
					v_x /= v_vals.length;
					v_y /= v_vals.length;

					// -------------

					if( v_y > 0.2 ){
						var power = 0.5 * Math.min( v_y, 1 ) + 0.5;

						if( JL.webgl.active_camera.target.is_user ){
							JL.webgl.active_camera.target.throw_ball({ power,
								force_x : 10 * v_x,
							});
						}
					}

					// -------------

					// var prev = JL.webgl.variables.throw_prev;
					// var curr = JL.webgl.variables.throw_curr;

					// var y_delta = prev.y - curr.y;

					// if( y_delta > 0 ){
					// 	var t_factor = 1 - ( 0.05 * ( JL.functions.clamp( curr.t - prev.t, 5, 25 ) - 5 ) / 20 );

					// 	// var power = Math.min( ( JL.functions.clamp( y_delta, 0, 20 ) / 15 ) * t_factor, 1 );
					// 	var power = 0.5 * Math.min( ( JL.functions.clamp( y_delta, 0, 20 ) / 15 ) * t_factor, 1 ) + 0.5;

					// 	// if( power > 0.4 ){
					// 		if( JL.webgl.active_camera.target.is_user ){
					// 			JL.webgl.active_camera.target.throw_ball({ power,
					// 				force_x : 0.4 * ( prev.x - curr.x ),
					// 			});
					// 		}
					// 	// }
					// }

					// -------------

					delete JL.webgl.variables.throw_prev;
					delete JL.webgl.variables.throw_curr;
					delete JL.webgl.variables.throw_v;
				}
			}, }],
		},
	},
	environment : {
		custom_functions : {
			on_load : function(){
				try{ JL.webgl.device.options.vr.loading_background.hide(); } catch(e){}
			},
			pre_instantiate : function(){
				this.on_pause = function(){
					JL.webgl.ui.key_bindings.disable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.disable();
				};

				this.on_resume = function(){
					JL.webgl.ui.key_bindings.enable();
					if( JL.webgl.ui.mouse ) JL.webgl.ui.mouse.enable();
				};
			},
		}
	},
	load : {
		custom_functions : {
			assets_on_start : function( p ){
				try{ JL.webgl.device.options.vr.loading_background.show(); } catch(e){}
				JL.webgl.ui.intermediate_loading.show();
				p.callback();
			},
			assets_on_finish : function(){
				JL.webgl.ui.intermediate_loading.hide();
			},
		},
	},
});

window.onhashchange = function(){ JL.webgl.hashlinks.start(); window.location.reload(); };
// window.onload       = function(){ JL.webgl.hashlinks.start(); };
