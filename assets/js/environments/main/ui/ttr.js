JL.webgl.ui.item.ttr = function( p ){
	this.init( p );
};

JL.webgl.ui.item.ttr.css = `
	.ui-ttr{
		position:fixed;
		top:0;
		left:0;
	}

	#background-ttr{
		position:fixed;
		top :0;
		left:0;
		z-index:-1;
		width :100vw;
		height:100vh;
		pointer-events:none;
		background-color:#000;
		background-repeat:no-repeat;
		background-position:center bottom;
		background-size:auto calc( 100% - 40px );
	}

	.ui-ttr .tap-circle{
		position:fixed;
		left:calc( 50vw - 8vh );
		bottom:2.5vh;
		width :16vh;
		height:16vh;
		background:rgba(0,55,0,0.25);
		border:1px solid rgba(255,255,255,0.45);
		opacity:0;
	}

	.ui-ttr .tap-circle.left{
		background:rgba(55,0,0,0.25);
		left:calc( 50vw - 24vh );
	}

	.ui-ttr .tap-circle.right{
		background:rgba(0,0,55,0.25);
		left:calc( 50vw + 8vh );
	}

	.ui-ttr .top-bar{
		position:fixed;
		top:0;
		left:0;
		width:100vw;
		padding:5px;
		box-sizing:border-box;
		background:#000;
		color:#fff;
		box-shadow:0 0px 6px 3px #000;
	}

	.ui-ttr .score{
		text-align:center;
		color:#fff;
		font-size:24px;
		font-weight:700;
	}

	.ui-ttr .small-score{
		font-size:10px;
		font-weight:700;
		position:absolute;
		top:2px;
		text-align:center;
	}

	.ui-ttr .small-score .lbl{
		font-weight:300;
	}

	.ui-ttr .small-score .val{
		font-size:16px;
	}

	.ui-ttr #score-streak { left :10px; }
	.ui-ttr #score-mult   { left :70px; }
	.ui-ttr #score-percent{ right:10px; }

	@media only screen and (max-width : 500px) {
		.ui-ttr .options .option{
			width:100vw;
		}
	}

	.ttr-debug{
		position:fixed;
		color:#fff;
		background:#000;
		font-size:12px;
	}

	#ttr-debug-time{
		bottom:40px;
		right:calc( 50vw - 40vh );
	}

	#game-over{
		position:fixed;
		top:0;
		left:0;
		width :100vw;
		height:100vh;
		background:#000;
		color:#fff;
		text-align:center;
	}

	#game-over .header{
		background:linear-gradient( 0deg, #111, #333 );
		color:#4e82e7;
		font-size:24px;
		font-weight:700;
		text-align:center;
		padding:10px;
		border-bottom:2px solid #000;
		box-shadow:0 -2px 9px 1px rgba(255,255,255,0.5);
	}

	#game-over .final-score-container{
		background:#111;
		margin-top:15px;
		border:1px solid rgba(255,255,255,0.15);
		border-left:0;
		border-right:0;
		text-align:center;
		padding:15px;
	}

	#game-over .stats-container{
		background:linear-gradient( 0deg, #222, #111 );
		border:4px solid #000;
		outline:1px solid rgba(255,255,255,0.25);
		border-radius:15px;
		padding:10px 5px;
		max-width:500px;
		margin:auto;
	}

	#game-over .final-score{
		font-size:36px;
		font-weight:700;
	}

	#game-over .stat{
		display:inline-block;
		margin:0 20px;
	}

	#game-over .stat .lbl{
		color:#707e95;
	}

	#game-over .stat .val{
		font-size:24px;
		font-weight:700;
	}

	#game-over .button{
		display:inline-block;
		background:#111;
		color:#ccc;
		font-weight:700;
		margin:15px 20px;
		border:1px solid rgba(255,255,255,0.25);
		padding:10px 30px;
		border-radius:100px;
		cursor:pointer;
	}

	#game-over .button:hover{
		background:#103360;
	}

	#game-over .button i{
		color:#5c9eee;
		margin-right:5px;
	}

	#copy-recording{
		position:fixed;
		left:0;
		top:50px;
		background:#2f572f;
		color:#fff;
		border:1px solid rgba(255,255,255,0.5);
		cursor:pointer;
		padding:4px 10px;
	}

	#copy-recording:hover{
		background:#588c58;
	}
`;

JL.webgl.ui.item.ttr.ui_framework = function(){
	var ui_info = this.ui_info.ttr;

	var is_mobile = ( $( window ).width() < 900 );

	var on_tap     = ( is_mobile ? [ 'ontouchstart', ] : [ 'onmousedown', ] );
	var on_release = ( is_mobile ? [ 'ontouchend', 'ontouchcancel', ] : [ 'onmouseup', ] );

	return `<div id="ttr" class="ui-ttr no-highlight">

		<div class="tap-circle left " ` + on_tap.map( k => k + '="JL.webgl.active_camera.target.tap( 0 );"' ).join(' ') + ` ` + on_release.map( k => k + '="JL.webgl.active_camera.target.release( 0 );"' ).join(' ') + `></div>
		<div class="tap-circle      " ` + on_tap.map( k => k + '="JL.webgl.active_camera.target.tap( 1 );"' ).join(' ') + ` ` + on_release.map( k => k + '="JL.webgl.active_camera.target.release( 1 );"' ).join(' ') + `></div>
		<div class="tap-circle right" ` + on_tap.map( k => k + '="JL.webgl.active_camera.target.tap( 2 );"' ).join(' ') + ` ` + on_release.map( k => k + '="JL.webgl.active_camera.target.release( 2 );"' ).join(' ') + `></div>` + 

		`<div class="top-bar">
			<div class="score">0</div>

			<div class="small-score" id="score-streak">
				<div class="val">0</div>
				<div class="lbl">STREAK</div>
			</div>

			<div class="small-score" id="score-mult">
				<div class="val">1x</div>
				<div class="lbl">MULTIPLIER</div>
			</div>

			<div class="small-score" id="score-percent">
				<div class="val">0</div>
				<div class="lbl">HIT %</div>
			</div>
		</div>
	</div>
	<div id="background-ttr" style="background-image:url(` + this.path + `/background.jpg );"></div>` +
	( !this.is_recording ? '' : 
		'<div id="copy-recording" onclick="JL.webgl.active_camera.target.copy_recorded_notes_to_clipboard();">Copy Recording</div>'
	) +
	( !JL.webgl.hashlinks.get_val( 'edit' ) ? '' : 
		'<div id="ttr-debug-time" class="ttr-debug"></div>'
	)
	;
};

JL.webgl.ui.item.ttr.set_multiplier = function( val ){
	$( '#score-mult .val' ).html( val + 'x' );
};

JL.webgl.ui.item.ttr.update_score = function(){
	var ui_info = JL.webgl.active_camera.target.ui_info.ttr;

	$( '#ttr .score' ).html( JL.functions.number_with_commas( ui_info.score ) );

	$( '#ttr #score-streak .val' ).html( ui_info.streak );

	$( '#ttr #score-percent .val' ).html( Math.floor( 100 * ( ui_info.hit_notes / ui_info.total_notes ) ) );
};

JL.webgl.ui.item.ttr.end_game = function(){
	var ui_info = JL.webgl.active_camera.target.ui_info.ttr;

	if( ui_info.streak > ui_info.longest_streak ) ui_info.longest_streak = ui_info.streak;

	$( '#ttr' ).html(
		'<div id="game-over">' + 
			'<div class="header">Game Stats</div>' +
			'<div class="final-score-container">' +
				'<div class="stats-container">' +
					'<div class="final-score">' + JL.functions.number_with_commas( ui_info.score ) + ' pts</div>' +
					'<br>' +
					'<div class="stat">' +
						'<div class="lbl">Tap Accuracy</div>' +
						'<div class="val">' + ( Math.floor( 100 * ( ui_info.hit_notes / ui_info.total_notes ) ) ) + '%</div>' +
					'</div>' +
					'<div class="stat">' +
						'<div class="lbl">Longest Streak</div>' +
						'<div class="val">' + ui_info.longest_streak + '</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<a href="index.html"><div class="button"><i class="fa fa-bars"></i> MAIN MENU</div></a>' +
			'<div class="button no-highlight" onclick="window.location.reload();"><i class="fa fa-undo"></i> REPLAY TRACK</div>' +
		'</div>'
	);
};
