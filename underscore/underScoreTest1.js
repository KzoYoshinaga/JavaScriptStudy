$(function(){

	// 関数オブジェクトの関数
	// fun.apply(thisArg[,argsArray])
	// 引数
	// thisArg : fun関数を呼び出す際に渡すthis値
	//		呼び出したメソッドがnon-strictmode内の関数ならば
	//		nullもしくはundefinedであった場合はグローバルオブジェクトに置き換えられる
	//		プリミティブ型の場合はボックス化される
	// argsArray : 配列風オブジェクト。fun関数が呼ぶことになる引数の列挙
	//		引数が渡されない場合はnullあるいはundefined

	// 関数定義
	function fun(x,y){console.log("fun : " +(x+y))}
	fun.apply(null,[1,2]);
	
	// 関数はオブジェクト
	fun2 = function(x,y,z){console.log("fun2 : " +(x+y+z))};
	fun2.apply(null,[1,2,3]);

	// 関数を引数に取り、戻り値として関数を返す関数
	function splat(fun) {
		return function(array) {
				return fun.apply(null,array);
			}
	}
	var addArrayElements = splat(function(x,y) { return x + y  });
	result = addArrayElements([1,2]);
	console.log("splat : " + result);


	// call()メソッドは連続した引数のリストを受け取る
	// arguments : 関数内に自動で設定されるローカル変数
	//		配列風構造体で関数呼び出し時に引数として与えられた値を保持
	function unsplat(fun) {
		return function() {
			return fun.call(null,_.toArray(arguments));
			}
	}
	var joinElements = unsplat(function(array) { return array.join(' ')});
	result = joinElements(1,2);
	console.log("unsplat : " + result);
	result = joinElements('a','x','!');
	console.log("unsplat : " + result);

	// arguments
	var argFun = function() {console.log("arguments[0] : " + arguments[0])};
	argFun('a');

	// comparetor : 引数を２つ取り(a,b) a < b :-1 ,a==b : 0 ,a > b : 1 を返す
	var compareLessThanOrEqual = function(x,y){
		if(x < y) return -1;
		if(x > y) return  1;
		return 0;
	}
	
	console.log("comparetor : " + [2,3,4,3,5,2,3,5,2].sort(compareLessThanOrEqual));

	// _.contains(list, value)
	console.log("_.contains([2,3],3) : "+ _.contains([2,3],3)); // true
	console.log("_.contains([2,3],1) : "+ _.contains([2,3],1)); // false
	console.log("_.contains([[2,3]],[2,3]) : "+ _.contains([[2,3]],[2,3])); // false
	console.log("_.contains(3,3) : "+ _.contains(3,3)); // false

	// predicate : 常に真偽値を返す関数
	var lessOrEqual = function (x,y) {
		return x <= y;
	}

	console.log("predicate : " + [-2,3,4,-3,5,2,0,3,5,2].sort(lessOrEqual)); // ソートされない＞＜

	// predicater => comperator 戻り値のマッピング
	// truthy関数は後で実装
	function comparator(pred) {
		return function(x,y){
			if(truthy(pred(x,y))) return -1;
			else if (truthy(pred(y,x))) return 1;
			else return 0;
		};
	}
	
	console.log("pred to comp : " + [-2,3,4,-3,5,2,0,3,5,2].sort(comparator(lessOrEqual))); // 

	// csvパーサ
	function lameCSV(str) {
		return _.reduce(str.split("\n"),function(table,row){
			table.push(_.map(row.split(","), function (c) {return c.trim()}));
			return table;
		},[]);
	}
	
	var csv = "name,age,hair\nMarble,35,red\nBob,64,blonde";
	var peopleTable = lameCSV(csv);
	console.log("peopleTable");
	peopleTable.forEach(console.log);
	
	// _.rest(array,[index]) index以降の配列を返す、indexなし（引数がarrayのみ）の場合最初の要素を除いた配列
	var restTable = _.rest(peopleTable).sort();
	console.log("restTable");
	restTable.forEach(console.log);

	// _.first(array,[n]) 配列arrayの最初の要素を返す、nを指定すると最初のn個を返す
	// 特定の要素のみ指定できる関数を独自にmapの引数に置くことで抽出方法を制御できる
	function selectNames(table) {
		return _.rest(_.map(table,_.first));
	}
	var firstColumn = selectNames(peopleTable);
	console.log("firstColumn name : " + firstColumn);

	function selectAges(table) {
		return _.rest(_.map(table, 1));
	}
	var secondColumn = selectAges(peopleTable);
	console.log("secondColumn age : " + secondColumn);

	function selectHairColor(table) {
		return _.rest(_.map(table,2));
	}
	var thirdColumn = selectHairColor(peopleTable);
	console.log("thirdColumn hairColor : " + thirdColumn);
	
	// _.zip(*array) : 渡されたそれぞれの配列の同じインデックスにある要素を新たな配列の要素としてまとめて、
	// それぞれの配列を要素に持った配列を返す。
	// (e.g.) _.zip([1,2,3],['a','b','c']) -> [[1,'a'][2,'b'][3,'c']]  行列積っぽい
	var mergeResult = _.zip;
	var zipTable = mergeResult(secondColumn,thirdColumn);
	console.log("zip : " + zipTable);
	
	// Javascriptの癖の矯正
	function existy(x) {return x != null};
	function truthy(x) {return ( x != false) && existy(x)};


	// _.isFunction(o) : oが関数のときにtrueを返す
	var o1 = function(){return null;}
	var o2 = 2;
	console.log("o1 isFunction : " + _.isFunction(o1));
	console.log("o2 isFunction : " + _.isFunction(o2));

	// field存在チェック
	function Pro(namae, tosi) {
		this.namae = namae;
		this.tosi = tosi;
	}

	Pro.protoType = {
		donothing : function(){}
	};

	var o = new Pro("tanaka",20);

	function doWhen(cond, action) {
		if(truthy(cond))
			return action();
		else
			return undefined;
	}

	function executeIfHasField(target, name){
		return doWhen(existy(target[name]),function(){
			var result = _.result(target, name);
			console.log(['結果は',result].join(' '));
			return result;
		});
	}

	var result = executeIfHasField(o,"namae");
	console.log(["o['namae']", o["namae"]].join(' : '));
	console.log(["executeIfHasField(o,'namae')", result].join(' : '));
	var result = executeIfHasField(o,"hairVolume");
	console.log(["o['hairVolume']", o["hairVolume"]].join(' : '));
	console.log(["executeIfHasField(o,'hairVolume')", result].join(' : '));
	
	executeIfHasField([1,2,3],'reverse');
	executeIfHasField({foo : 42}, 'foo');
	executeIfHasField([1,2,3],'notHere');

	// console 出力
	function log(text,result) {
		console.log([text,result].join(" : "));
	}

	// Array#map : 配列のそれぞれの要素に引数に与えた関数を実行し
	// 結果を格納した新しい配列を返す
	var result = [null,undefined,1,2,false].map(existy);
	log("[null,undefined,1,2,false].map(existy)",result);
	var result = [null,undefined,1,2,false].map(truthy);
	log("[null,undefined,1,2,false].map(truthy)",result);

	// _.each(list,iterator,[context])
	// listを走査して、それぞれの要素をiterator関数に与えて実行
	// contextを渡している場合はiteratorはcontextにバインドされる
	// listが配列の場合、iteratorには要素,インデックス,配列の３つの引数が与えられる
	// listがオブジェクトの場合、値,キー,オブジェクトの３つが渡される

	var list = [1,2,3,4];
	function doSomething(x,i,list) {
		list[i] = x+1;
	}
	_.each(list,doSomething);
	log("_.each(list,doSomething)",list);

	// JavaScriptベンチマーク http://www.jsperf.com

	// JavaScriptライブラリ探す http://microjs.com

	// 無名関数の生成と実行
	log("無名関数 42 + (function(){return 3})())",42 + (function(){return 3})());

	
	// 第一級とは
	// 第一級である『何か』がただの値であるか
	// 他のどんな値もできることが出来る存在であるか
	// (e.g.) 数値は値である
	// 	変数に格納できる、配列の要素として格納できる
	// 	オブジェクトのフィールドに格納できる
	// 	任意の時点で生成することができる
	// 	関数に引数として渡すことができる
	// 	関数の戻り値になれる
	
	// 高階関数（下記のひとつ、もしくは両方を満たす）
	// 引数として関数をとる
	// 戻り値として関数を返す
	
	// 高階関数の例
	_.each(['whiskey','tango','foxtrot'],function(word) {
		console.log(word.charAt(0).toUpperCase()+ word.substr(1));
	});

});