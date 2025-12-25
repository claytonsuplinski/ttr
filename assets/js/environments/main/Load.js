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
