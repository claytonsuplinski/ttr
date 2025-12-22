JL.webgl.ui.item.main_menu = function( p ){
	this.init( p );
};

JL.webgl.ui.item.main_menu.css = `
	.ui-main-menu{
		position:fixed;
		top:0;
		left:0;
		width :100vw;
		height:100vh;
		background:linear-gradient( 90deg, rgb(0, 0, 0) 0%, rgba(236, 164, 164, 0.75) 40%, rgba(255,255,255, 0.3) 70%, rgba(255,255,255,0) 100% );
		overflow:auto;
	}

	.ui-main-menu .title{
		font-size:30px;
		background:#265d71;
		background:linear-gradient( -90deg, rgba(162, 211, 229, 0.11), #264a71 );
		border-bottom:1px solid rgba(255, 255, 255, 0.3);
		width:100%;
		padding:20px;
		color:#fff;
		text-shadow: 1px  1px #003e55,
			    -1px  1px #003e55,
			     1px -1px #003e55,
			    -1px -1px #003e55;
	}

	.ui-main-menu .title img{
		height:34px;
		margin-right:4px;
		vertical-align:top;
	}

	.ui-main-menu .options{
		padding-bottom:25px;
	}

	.ui-main-menu .options .option{
		width:100vw;
		max-width:350px;
		font-size:16px;
		font-weight:700;
		color:#ffeded;
		cursor:pointer;
		background:linear-gradient( 90deg, rgba(119, 8, 8, 0.9), rgba(255, 255, 255, 0) );
		border:1px solid rgba(255, 156, 156, 0.9);
		border-left:0;
		border-right:0;
		padding:15px 50px;
		margin:10px 0 0;
	}

	.ui-main-menu .options .option:hover{
		background:rgba(181, 38, 38, 0.9);
	}

	#main-menu-settings{
		padding:10px;
		padding-bottom:0;
	}

	#main-menu-settings .jl-json-edit td.lbl{
		background:#333;
		width:150px;
		vertical-align:middle;
		padding:0 5px;
		font-size:14px;
		border:1px solid rgba(255,255,255,0.4);
	}

	#main-menu-settings .jl-json-edit select,
	#main-menu-settings .jl-json-edit textarea,
	#main-menu-settings .jl-json-edit input{
		background:#34567a;
	}

	#main-menu-settings .jl-json-edit input{
		padding:5px;
	}

	@media only screen and (max-width : 500px) {
		.ui-main-menu .options .option{
			width:100vw;
		}
	}
`;

JL.webgl.ui.item.main_menu.start_game = function(){
	JL.webgl.hashlinks.add({
		environment : [ 'main', 'tracks', 
			JL.webgl.variables.ttr.Song.split(' - ').map(function( s ){
				return JL.functions.remove_whitespace( JL.functions.remove_whitespace( s.toLowerCase() ) );
			}).join('_'),
		].join(','),
	});
};

JL.webgl.ui.item.main_menu.ui_framework = function(){
	return `<div id="main-menu" class="ui-main-menu">
		<div class="title">
			<img src="./assets/textures/menu_target.png" />
			TTR
		</div>
		<div id="main-menu-settings"></div>
		<div class="options">
			<div class="option" onclick="JL.webgl.ui.item.main_menu.start_game();">Start Game</div>
		</div>
	</div>`;
};

JL.webgl.ui.item.main_menu.ui_onselect = function(){
	if( !JL.webgl.variables.ttr ) JL.webgl.variables.ttr = {};

	var options = [
		{ name : 'Test - Track', },
	];

	JL.webgl.variables.ttr.Song = options[0].name;

	new JL.json_edit({
		parent    : { id : '#main-menu-settings' },
		value     : JL.webgl.variables.ttr,
		structure : [
			{ label : 'Song', type : 'dropdown', options, },
		],
	});
};
