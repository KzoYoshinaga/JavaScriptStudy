// initialize

var tableStartX = 120;
var tableStartY = 120;
var tablePaddingX = 5;
var tablePaddingY = 5;
var imageSizeX = 50;
var imageSizeY = 50;
var masuSizeX = 9;
var masuSizeY = 9;


$(function(){
	// borderはwidth,heightの外側に付く
	$("#main").append("<div id='kuroKomadai' style='position:absolute;top:0px;left:0px;background-color:#FFFFFF;width:100px;height:100px;border:1px solid #000000;'></div>");
	
	var tableStartX = 120;
	var tableStartY = 120;
	var tablePaddingX = 5;
	var tablePaddingY = 5;
	var imageSizeX = 50;
	var imageSizeY = 50;
	var masuSizeX = 9;
	var masuSizeY = 9;
	
	$("#main").append("<div id='table' style='background-image:url(image/haikei.png); position:absolute;left:" + (tableStartX - tablePaddingX) + "px;top:" + (tableStartY- tablePaddingY) + "px;background-color:#FFFFFF;width:" + (imageSizeX * masuSizeX + (tablePaddingX * 2)) + "px;height:" + (imageSizeY * masuSizeY + tablePaddingY * 2) + "px;border:1px solid #000000;'></div>");
	
	for(j=1;j<=masuSizeY;j++){
		for(i=1;i<=masuSizeX;i++){
				$("#main").append("<div id='masu_" + i + "_" + j + "' onClick='masuSelect(" + i + "," + j + ")'  style='position:absolute;left:" + (tableStartX + (i - 1) * imageSizeX) + "px;top:" + (tableStartY + (j-1) * imageSizeY) + "px;width:" + imageSizeX + "px;height:" + imageSizeY + "px;border:1px solid #000000;'></div>");
		}
	}
	
	
	// 駒初期配置
	setKomaToMasu(7,9,8,7,false,true);
	setKomaToMasu(8,9,9,7,false,true);
	setKomaToMasu(9,9,10,7,false,true);
	
});

function getNewKomaTag(x,y,komaId,komaType,isNari,isSiro){
	var imageStyle = isSiro == true ? "": "transform:scale( -1, -1);-o-transform:rotate(180deg);-ms-transform:scale( -1, -1);-moz-transform:scale( -1, -1);-webkit-transform:scale( -1, -1);filter:flipv() fliph();-ms-filter:flipv() fliph();";
	return "<img isSiro='" + isSiro + "' isNari='" + isNari + "' komaType='" + komaType + "' id='koma_" + komaId + "' src='image/mokume" + komaType + ".png' onClick='komaSelect(" + [x,y,komaId].join(",") + ")'  style='position:absolute;left:0px;top:0px;width:" + imageSizeX + "px;height:" + imageSizeY + "px;border:none;z-index:2'></div>"
}

function setKomaToMasu(x,y,komaId,komaType,isNari,isSiro) {
	$(["#masu" ,x,y].join("_")).append(getNewKomaTag(x,y,komaId,komaType,isNari,isSiro));
}

var selectedKomaId = null;

// Javascriptの癖の矯正
function existy(x) {return x != null};
function truthy(x) {return ( x != false) && existy(x)};


function masuSelect(i,j) {
	console.log("select : " + i + "_" + j);
}

function masuClear(x,y) {
	$("#masu_"+ x + "_" + y).empty();
}

function komaSelect(x,y,komaId) {
	console.log("existy : " + existy(selectedKomaId));
	if(existy(selectedKomaId) == false) {
		console.log("selectedKoma : " + selectedKomaId);
		selectedKomaId = komaId;
		
		// 選択画像かぶせる＆アニメーション
		$("#masu_" + x + "_" + y).append("<img id='select' onClick='selectCancel()' src='image/select.png' style='position:absolute;left:0;top:0;z-index:3'>");
		selectFade();
		
		// 移動先候補表示 isSiro = false で上下反転
		$("#masu_" + x + "_" + (y - 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x,y-1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + x + "_" + (y - 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x,y-2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + x + "_" + (y + 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x,y+1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + x + "_" + (y + 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x,y+2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		
		$("#masu_" + (x - 1) + "_" + y).append("<img class='targettable' onClick='komaMove(" + [x,y,x-1,y,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x - 2) + "_" + y).append("<img class='targettable' onClick='komaMove(" + [x,y,x-2,y,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 1) + "_" + y).append("<img class='targettable' onClick='komaMove(" + [x,y,x+1,y,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 2) + "_" + y).append("<img class='targettable' onClick='komaMove(" + [x,y,x+2,y,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");

		
		$("#masu_" + (x - 1) + "_" + (y - 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x-1,y-1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x - 2) + "_" + (y - 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x-2,y-2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 1) + "_" + (y - 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x+1,y-1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 2) + "_" + (y - 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x+2,y-2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x - 1) + "_" + (y + 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x-1,y+1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x - 2) + "_" + (y + 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x-2,y+2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 1) + "_" + (y + 1)).append("<img class='targettable' onClick='komaMove(" + [x,y,x+1,y+1,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
		$("#masu_" + (x + 2) + "_" + (y + 2)).append("<img class='targettable' onClick='komaMove(" + [x,y,x+2,y+2,komaId].join(",") + ")' src='image/targettable.png' style='position:absolute;left:0;top:0;z-index:1'>");
	}
}

function selectFade() {
	$("#select").fadeOut(1000,function(){
			$("#select").fadeIn(500,function(){
				selectFade();
			});
		});
}

function selectCancel(){
	$("#select").remove();
	$(".targettable").remove();
	selectedKomaId = null;
}

function komaMove(x,y,nextMasuX,nextMasuY,komaId) {
	dx = nextMasuX - x;
	dy = nextMasuY - y;
	imageSizeX = 50;
	imageSizeY = 50;
console.log("move koma : " + x + "_" + y + "_" + komaId);
	var komaType = $("#koma_" + komaId).attr("komaType");
	var isNari = $("#koma_" + komaId).attr("isNari"); 
	var isSiro = $("#koma_" + komaId).attr("isSiro");
	
	if(isValidMasu(nextMasuX,nextMasuY)){
		// 移動先マスカラー変更
		$("#masu_"+ nextMasuX + "_" + nextMasuY).append("<img id='target' src='image/target.png' style='position:absolute;left:0;top:0;z-index:1'>");
		
		// selectFadeキャンセル表示固定
		$("#select").remove();
		$("#masu_" + x + "_" + y).append("<img id='select' onClick='selectCancel()' src='image/select.png' style='position:absolute;left:0;top:0;'>");
		
		// 移動エフェクト
		if(isFoeBase(nextMasuY, isSiro) == true && isNari == "false"){
			// 成り
			$("#koma_" + komaId).animate({left:(dx * imageSizeX),top:(dy * imageSizeY)},500,
			function(){
				if(confirm("成りますか") == true){
					masuClear(x,y);
					// 駒タイプから裏駒タイプ取得 test 1
					setKomaToMasu(nextMasuX,nextMasuY,komaId, 1,true,isSiro);
					$("#koma_" + komaId).animate({left:25,width:0},500,function(){$("#koma_" + komaId).attr({"src":"image/mokume1.png"});}).animate({left:0,width:50},500,function(){
							$("#select").remove();
							$("#target").remove();
							$(".targettable").remove();
							selectedKomaId = null;
							});
				} else {
					//通常移動
					masuClear(x,y);
					masuClear(nextMasuX,nextMasuY);
					setKomaToMasu(nextMasuX,nextMasuY,komaId,komaType,isNari,isSiro);
					$("#select").remove();
					$("#target").remove();
					$(".targettable").remove();
					selectedKomaId = null;
				}
			}
		);
			
		} else {
			// 通常移動
			$("#koma_" + komaId).animate({left:(dx * imageSizeX),top:(dy * imageSizeY)},500,
				function(){
					masuClear(x,y);
					masuClear(nextMasuX,nextMasuY);
					setKomaToMasu(nextMasuX,nextMasuY,komaId,komaType,isNari,isSiro);
					$("#select").remove();
					$("#target").remove();
					$(".targettable").remove();
					selectedKomaId = null;
				}
			);
		}
	}
}

function isFoeBase(y, isSiro) {
	if(isSiro == "true"){
		return y >=1 && y <=3;
	} else {
		return y >=7 && y <=9;
	}
}

function isValidMasu(x,y) {
	return x >= 1 && x <= 9 && y >=1 &&y <= 9;
}
