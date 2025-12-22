JL.webgl.functions.init_environment( [ 'main' ], {
	lights      : [{ position : [ 3, 10, 3 ], ambient : 0.2, color : [ 0.8, 0.8, 0.8 ] }],
	load_groups : [ 'Main Zone' ],
});

JL.webgl.environments.main.load = function(){
	this.add_space_object({
		graphics_objects : [ this.get_graphics_objects([ 'menu_target' ]) ],
		// camera_offset    : { lat : 40, rad : 1.5 },
		camera_offset    : { lat : 50, rad : 2, offset : [0.2, -0.25, -0.5] },
		draw_xyz         : true,
		ui_elements      : [ 'main_menu' ],
		select           : true,
		// ui_info          : {
		// 	main_menu : {},
		// },
		per_frame_functions : [
			function(){ try{ JL.webgl.active_camera.lon += 0.1; } catch(e){} },
		],
	});
};
