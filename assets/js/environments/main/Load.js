Object.assign( JL.webgl.load.groups, {
	"Main Zone": {
		steps : [
			{
				init : function(callback){
					JL.webgl.load.graphics_objects_list( this, [
						{
							label  : [ 'environments', 'main', 'menu_target' ],
							type   : "extruded_png",
							params : {
								image     : './assets/textures/menu_target.png',
								depth     : 0.5,
								back_face : true,
							}
						},
					]);
					callback();
				}
			},
		],
		scripts : [
			"./assets/js/environments/main/ui/main_menu.js",
		]
	},
	"TTR": {
		steps : [
			{
				init : function(callback){
					JL.webgl.load.graphics_objects_list( this, [
						{
							label      : [ 'player_arrow' ],
							keys       : [ 'interface', 'pointer' ],
							params     : {
								properties : { effects : [ "_dynamic_color", "_hue_rotate", "_hue_rotate_crystals" ] },
								transforms : [
									{ type : 'rotate'   , axis : 'x', val : 90 },
									{ type : 'translate', y : 0.1 },
								],
								attr       : {
									frags_vec4  : { color_main : [1,0,0,0], },
									frags_float : {
										hue_rotate_crystals_mag   : 0.5,
										hue_rotate_crystals_scale : 5,
									},
								},
							},
						},
					]);
					callback();
				}
			},
		],
		scripts : [
			"./assets/js/environments/main/ui/ttr.js",

			"./assets/js/environments/main/space_object/ttr.js",
		]
	},
} );
