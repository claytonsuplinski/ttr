JL.webgl.space_object.ttr = JL.functions.inherit_class( function(){}, JL.webgl.space_object._regular, {
	_inputs_exclude : [ 'name', ].map( key => ({ key, }) ),
	_inputs : [
		{ key : 'notes', type : 'arr'   , force_single_line_arr : 1, ui_order : '0_a',
			structure : [
				// 0 == no note, 1 == regular note, 2 == shake (left,up,right)
				{ key : 'lanes', type : 'arr', length : 3, force_single_line_arr : 1, get_default : function(){ return [0,0,0]; },
					structure : { type : 'int', no_label : 1, style : 'width:25px;min-width:auto;text-align:center;', },
				},
				{ key : 'start', type : 'str', classes : 'right', style : 'width:40px;min-width:auto;', },
				{ key : 'end'  , type : 'str', classes : 'right', style : 'width:40px;min-width:auto;', optional : 1, },
			],
		},
	]
} );

JL.webgl.space_object.ttr.prototype.song_title_to_key = function( title ){
	var parts = title.split(' - ');

	return [
		parts[ 0 ],
		parts.slice( 1 ).join(''),
	].map( x => JL.functions.remove_punctuation( JL.functions.remove_whitespace( x.toLowerCase() ) ) ).join('_');
};

JL.webgl.space_object.ttr.prototype.time_str_to_float = function( time_str ){
	if( time_str.includes(':') ){
		var y_parts = time_str.split(':');

		return ( 60 * Number( y_parts[0] ) ) + Number( y_parts[1] );
	}

	return Number( time_str );
};

JL.webgl.space_object.ttr.prototype._constructor = function( p ){
	var self = this;

	this.path = ( this.Song ? 
		JL.webgl.dir.environments + '/main/tracks/' + this.song_title_to_key( this.Song ) : 
		JL.webgl.dir.environments + '/' + JL.webgl.hashlinks.get_val( 'environment' ).split(',').join('/')
	);

	// Load notes from optional notes.csv file.
	$.ajax({
		url      : this.path + '/notes.csv',
		dataType : 'text',
		async    : false,
		success  : function( data ){
			var csv = JL.functions.parse_csv_text( data );

			for( var r of csv.entries ){
				if( r.length < 3 || r[1] == undefined ) continue;

				self.notes.push({
					lanes : r.slice( 0, 3 ),
					start : String( r[3] ),
					end   : ( r[4] ? String( r[4] ) : undefined ),
				});
			}
		},
	});

	try{ Object.assign( this, JL.webgl.variables.ttr ); } catch(e){}

	this.camera_offset = { lat : 30, lon : 0, rad : 3, offset : [ 0, 0, 1.25 ], };

	this.note_time_threshold = 0.25;

	this.is_holding = {};

	var note_instances = [];
	var hold_instances = [];

	this.lanes_notes = [ [], [], [] ];
	this.lanes_holds = [ [], [], [] ];

	for( var note of this.notes ){
		note.time_start = this.time_str_to_float( note.start );

		note.z = -note.time_start;

		if( note.end ) note.z_end = -this.time_str_to_float( note.end );
	}

	this.notes = this.notes.sort( (a,b) => ( a.time_start - b.time_start ) );

	for( var note of this.notes ){
		var dur = 0;
		if( note.end ) dur = note.z_end - note.z;

		if( note.lanes[0] ){
			note_instances.push({ x : -0.25, z : note.z, });
			this.lanes_notes[0].push( Object.assign( JL.functions.deep_copy( note ),
				{ index : note_instances.length - 1, hold_index : ( dur ? hold_instances.length : undefined ) }
			) );
			if( dur ){
				hold_instances.push({ x : -0.25, z : note.z, dur, });
				this.lanes_holds[0].push( Object.assign( JL.functions.deep_copy( note ), { index : hold_instances.length - 1 }) ); 
			}
		} 
		if( note.lanes[1] ){
			note_instances.push({ x : 0, z : note.z, });
			this.lanes_notes[1].push( Object.assign( JL.functions.deep_copy( note ),
				{ index : note_instances.length - 1, hold_index : ( dur ? hold_instances.length : undefined ) }
			) );
			if( dur ){
				hold_instances.push({ x : 0, z : note.z, dur, });
				this.lanes_holds[1].push( Object.assign( JL.functions.deep_copy( note ), { index : hold_instances.length - 1 }) );
			}
		}
		if( note.lanes[2] ){
			note_instances.push({ x : 0.25, z : note.z, });
			this.lanes_notes[2].push( Object.assign( JL.functions.deep_copy( note ),
				{ index : note_instances.length - 1, hold_index : ( dur ? hold_instances.length : undefined ) }
			) );
			if( dur ){
				hold_instances.push({ x : 0.25, z : note.z, dur, });
				this.lanes_holds[2].push( Object.assign( JL.functions.deep_copy( note ), { index : hold_instances.length - 1 }) );
			}
		}
	}

	this._original_lanes_notes = JL.functions.deep_copy( this.lanes_notes );

	this.parts_texture = this.path + '/parts.png';

	this.notes_g_o = JL.webgl.functions.create_graphics_object({
		type   : 'square',
		params : {
			named_textures  : { main : this.parts_texture, },
			properties      : { effects : [ '_plain', '_texture_size', '_instanced_pos', '_instanced_size', '_instanced_color_add', '_instanced_alpha_mult', '_instanced_texture_offset', ], },
			transforms      : [{ type : 'rotate', axis : 'x', val : -90, }, { type : 'scale', x : 0.2, z : 0.2 }, { type : 'translate', y : 0.02, }],
			dynamic_buffers : [ 'size', 'color_add', 'alpha_mult' ],
			attr            : {
				num_instances : note_instances.length,
				frags_float   : { texture_size   : 0.125, },
			},
			instanced_vals  : {
				pos : {
					x : note_instances.map( n => n.x ),
					y : note_instances.map( n => 0   ),
					z : note_instances.map( n => n.z ),
				},
				color_add : {
					r : note_instances.map( n => 0 ),
					g : note_instances.map( n => 0 ),
					b : note_instances.map( n => 0 ),
				},
				texture_offset : {
					x : note_instances.map(function( n ){
						if( n.x > 0 ) return 0.25;
						if( n.x < 0 ) return 0.0;
						return 0.125;
					}),
					y : note_instances.map( n => 0     ),
				},
				size       : { size : note_instances.map( n => 1 ), },
				alpha_mult : { a    : note_instances.map( n => 1 ), },
			},
		},
	});

	this.holds_g_o = JL.webgl.functions.create_graphics_object({
		type   : 'square',
		params : {
			// named_textures  : { main : this.parts_texture, },
			named_textures  : { main : './assets/textures/seamless/sci_fi_patterns/waves_01.jpg', },
			properties      : { effects : [ '_plain', '_instanced_pos', '_instanced_scl', ], },
			// properties      : { effects : [ '_plain', '_texture_repeat_3d', '_instanced_pos', '_instanced_scl', ], },
			// properties      : { effects : [ '_plain', '_pattern_squares_03', '_instanced_pos', '_instanced_scl', ], },
			// properties      : { effects : [ '_plain', '_texture_size', '_instanced_pos', '_instanced_scl', '_instanced_texture_offset', ], },
			transforms      : [{ type : 'scale', x : 0.05, }, { type : 'rotate', axis : 'x', val : 90, }, { type : 'translate', y : 0.01, }],
			attr            : {
				num_instances : hold_instances.length,
				// frags_float   : { texture_size   : 0.125, },
				// frags_float   : { rainbow_loop_x : 1, rainbow_loop_speed : 1, },
				// frags_float   : {
				// 	texture_repeat_3d_scl : 1,
				// },
			},
			dynamic_buffers : [ 'scl' ],
			instanced_vals  : {
				pos : {
					x : hold_instances.map( n => n.x ),
					y : hold_instances.map( n => 0   ),
					z : hold_instances.map( n => ( n.z + ( n.dur / 2 ) ) ),
				},
				scl : {
					x : hold_instances.map( n => 1 ),
					y : hold_instances.map( n => 1 ),
					z : hold_instances.map( n => n.dur ),
				},
				// texture_offset : {
				// 	x : hold_instances.map( n => 0.75 ),
				// 	y : hold_instances.map( n => 0.25 ),
				// },
			},
		},
	});

	this.notes_s_o = this.environment.add_space_object({
		graphics_objects : [ this.holds_g_o, this.notes_g_o, ],
		draw_xyz         : 1,
		z_index          : 1,
		parent_object    : this,
	});

	this.add_graphics_objects(
		[
			{
				type   : 'cube',
				params : {
					x : 0.3, y : 0, z : 0.01,
					transforms : [{ type : 'translate', y : -0.01 }],
					properties : {
						effects : [ '_plain', ],
						color   : '1.0,1.0,1.0,1.0',
					},
				},
			},
			...[
				{ x : -0.25, color : '1.0,0.5,0.5,1.0' },
				{ x :  0   , color : '0.5,1.0,0.5,1.0' },
				{ x :  0.25, color : '0.5,0.5,1.0,1.0' },
			].map(function( c ){
				return [
					{
						type   : 'sphere',
						params : {
							radius     : 0.35,
							transforms : [{ type : 'scale', x : 0.25, y : 0, z : 0.2 }, { type : 'translate', x : c.x }, ],
							properties : {
								effects : [ '_plain', ],
								color   : c.color,
							},
						},
					},
					{
						type   : 'square',
						params : {
							transforms : [{ type : 'scale', x : 0.01, y : 50 }, { type : 'rotate', axis : 'x', val : -90, }, { type : 'translate', x : c.x, z : -25 }, ],
							properties : {
								effects : [ '_plain', ],
								color   : c.color,
							},
						},
					},
				];
			}).flat(),
		].map( cfg => JL.webgl.functions.create_graphics_object( cfg ) )
	);

	this.start_dt  = new Date();
	this.curr_time = 0;

	this.audio = new Audio();

	if( !JL.webgl.variables.is_editing ){
		$( this.audio ).on( 'loadedmetadata', function(){ self.start_game(); });
	}

	this.audio.src = this.path + '/track.ttr';

	this.ui_elements = [ 'ttr', ];

	this.ignore_xyz = true;

	if( !this.ui_info ) this.ui_info = {};
	this.ui_info._game  = this;
	this.ui_info.ttr = {
		path           : this.path,
		score          : 0,
		streak         : 0,
		longest_streak : 0,
		total_notes    : 0,
		hit_notes      : 0,
	};
};

JL.webgl.space_object.ttr.prototype.do_success_note_visual = function( note_index ){
	var i_3 = note_index * 3;

	var name = 'success_' + note_index;

	var identifying_criteria = { _name : name, };

	var dur      = 0.2;
	var end_time = this.curr_time + dur;

	var fn = function(){
		var alpha = ( end_time - this.curr_time ) / dur;

		if( alpha <= 0 ){
			alpha = 0;
			this.remove_per_frame_functions( identifying_criteria );
		}

		this.notes_g_o.color_add[ i_3     ] = JL.functions.interpolate( -1, 0, alpha );
		this.notes_g_o.color_add[ i_3 + 1 ] = JL.functions.interpolate(  1, 0, alpha );
		this.notes_g_o.color_add[ i_3 + 2 ] = JL.functions.interpolate( -1, 0, alpha );

		this.notes_g_o.size[       note_index ] = JL.functions.interpolate( 3, 1, alpha );
		this.notes_g_o.alpha_mult[ note_index ] = JL.functions.interpolate( 0, 1, alpha );
	};

	this.add_per_frame_function( fn, identifying_criteria );
};

JL.webgl.space_object.ttr.prototype.do_failed_note_visual = function( note_index ){
	var i_3 = note_index * 3;

	this.notes_g_o.color_add[ i_3     ] =  0.5;
	this.notes_g_o.color_add[ i_3 + 1 ] = -0.5;
	this.notes_g_o.color_add[ i_3 + 2 ] = -0.5;

	this.notes_g_o.size[ note_index ] = 3;
};

JL.webgl.space_object.ttr.prototype.do_failed_hold_visual = function( hold_index ){
	var i_3 = hold_index * 3;

	this.holds_g_o.scl[ i_3     ] = 0;
	this.holds_g_o.scl[ i_3 + 1 ] = 0;
	this.holds_g_o.scl[ i_3 + 2 ] = 0;
};

JL.webgl.space_object.ttr.prototype.increment_score = function( p ){
	var val = Math.round( p.val );
	if( val > 0 ) val *= this.score_multiplier;

	this.ui_info.ttr.score += val;

	if( !p.hold ){
		if( p.val <= 0 ){
			if( !this.ui_info.ttr.longest_streak || this.ui_info.ttr.longest_streak < this.ui_info.ttr.streak ){
				this.ui_info.ttr.longest_streak = this.ui_info.ttr.streak;
			}

			this.ui_info.ttr.streak = 0;

			if( this.score_multiplier != 1 ) JL.webgl.ui.item.ttr.set_multiplier( 1 );

			this.score_multiplier = 1;

			if( p.note ){
				this.do_failed_note_visual( p.note.index );

				if( p.note.hold_index !== undefined ) this.do_failed_hold_visual( p.note.hold_index );
			}
		}
		else{
			this.ui_info.ttr.streak++;

			var next_multiplier = this.score_multiplier;

			if     ( this.ui_info.ttr.streak >= 50 ) next_multiplier = 8;
			else if( this.ui_info.ttr.streak >= 40 ) next_multiplier = 4;
			else if( this.ui_info.ttr.streak >= 30 ) next_multiplier = 3;
			else if( this.ui_info.ttr.streak >= 20 ) next_multiplier = 2;

			if( next_multiplier != this.score_multiplier ){
				this.score_multiplier = next_multiplier;
				JL.webgl.ui.item.ttr.set_multiplier( this.score_multiplier );
			}

			if( p.note ) this.do_success_note_visual( p.note.index );
		}
	}

	JL.webgl.ui.item.ttr.update_score();
};

JL.webgl.space_object.ttr.prototype.tap = function( lane ){
	var track = this.lanes_notes[ lane ];

	var correct_note = undefined;
	var note_value   = 0;
	if( track.length ){
		var curr_note = track[ 0 ];
		var time_diff = Math.abs( curr_note.time_start - this.curr_time );
		if( time_diff < this.note_time_threshold ){
			correct_note = track.shift();
			note_value   = JL.functions.interpolate( 100, 50, ( time_diff / this.note_time_threshold ) );
		}
	}


	if( correct_note ){
		this.ui_info.ttr.hit_notes++;
		this.ui_info.ttr.total_notes++;
		this.increment_score({ val : note_value, note : correct_note, });

		if( correct_note.end ){
			this.is_holding[ lane ] = { prev_time : this.curr_time, end : correct_note.end, note : correct_note, };
		}
	}
	else{
		this.increment_score({ val : -50, });
	}
};

JL.webgl.space_object.ttr.prototype.release = function( lane ){
	var hold = this.is_holding[ lane ];

	if( hold ){
		var note = hold.note;

		if( note ){
			if( note.hold_index !== undefined ) this.do_failed_hold_visual( note.hold_index );
		}

		delete this.is_holding[ lane ];
	}
};

JL.webgl.space_object.ttr.prototype.start_game = function( p ){
	var self = this;

	console.log( 'dur: ', this.audio.duration );

	this.audio.play();

	this.on_deselect = function(){
		self.audio.pause();
	};

	this.score_multiplier = 1;

	var identifying_criteria = { _name : 'ttr_main' };

	this.notes_s_o.add_per_frame_function(function(){
		if( self.audio.currentTime >= self.audio.duration ){
			JL.webgl.ui.item.ttr.end_game();
			this.remove_per_frame_functions( identifying_criteria );
		}

		this.z = self.curr_time = ( ( new Date() ).getTime() - self.start_dt.getTime() ) / 1000;

		self.missed_note_time = self.curr_time - self.note_time_threshold;

		for( var lane = 0; lane < self.lanes_notes.length; lane++ ){
			var track = self.lanes_notes[ lane ];
			var slice_index = undefined;
			for( var i = 0; i < track.length; i++ ){
				var note = track[ i ];

				if( note.time_start >= self.missed_note_time ) break;
				else{
					slice_index = i;

					self.ui_info.ttr.total_notes++;

					self.increment_score({ val : -50, note, });
				}
			}

			if( slice_index !== undefined ) self.lanes_notes[ lane ] = self.lanes_notes[ lane ].slice( slice_index + 1 );
		}

		for( var lane in self.is_holding ){
			var val = 0;
			if( self.curr_time >= self.is_holding[ lane ].end ){
				val = 50 * ( self.is_holding[ lane ].end - self.is_holding[ lane ].prev_time );

				delete self.is_holding[ lane ];
			}
			else{
				val = 50 * ( self.curr_time - self.is_holding[ lane ].prev_time );

				self.is_holding[ lane ].prev_time = self.curr_time;
			}

			self.increment_score({ val, hold : 1, note : self.is_holding[ lane ].note, });
		}
	}, identifying_criteria );

	if( JL.webgl.hashlinks.get_val( 'edit' ) ){
		this.notes_s_o.add_per_frame_function(function(){
			$( '#ttr-debug-time' ).html( self.audio.currentTime.toFixed(1) );
		});
	}
};
