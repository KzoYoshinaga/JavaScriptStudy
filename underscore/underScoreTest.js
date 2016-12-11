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

$(function(){

	function log(text,result){
		console.log([text,result].join(" : "));
	}

	// 命令型(imperatibve programming)
	console.log("Imperative ************************");
	var lyrics = [];
	for(var bottles = 3; bottles > 0; bottles--){
		lyrics.push(bottles + " remains");
		lyrics.push(bottles + " bottles of beer");
		lyrics.push("take one then turn to next");
		if(bottles > 1){
			lyrics.push((bottles - 1) + " remains");
		} else {
			lyrics.push("no beer remains");
		}
	}
	_.each(lyrics, function(line){console.log(line)});

	// _.chain(obj)
	// _.chain().fn1(args).fn2(args)...fun().value()
	// フレーズの生成を抽象化

	// _.range([start],stop,[step])
	// 連続した数値を格納した配列を生成
	// start省略0 step省略1

	console.log();
	console.log("Functional ***********************");
	console.log("Make Phrase -------------------")
	function lyricSegment(n) {
		return _.chain([])
			.push(n + " remains")
			.push(n + " bottles of beer")
			.push("take one then turn to next")
			.tap(function(lyrics){
				if(n > 1)
					lyrics.push((n-1) + " bottles of beer");
				else
					lyrics.push("no beer remains");
			})
			.value();
	}
	var lyrics = lyricSegment(3);
	_.each(lyrics, function(line){console.log(line)});

	console.log("Compose lyrics -------------------")
	function song(start, end, lyricGen) {
		return _.reduce(_.range(start,end,-1),function(acc,n){
				return acc.concat(lyricGen(n));
			},[]);
	}

	var lyrics = song(3,0,lyricSegment);
	_.each(lyrics, function(line){console.log(line)});

	//
	log("_.each",_.each);

	// this参照のアプローチ
	var bObj = {name:"b", fun: function(){return this;}};
	log("bObj",bObj.fun()); // object

	var bFunc = bObj.fun;
	log("bFunc",bFunc()); // window

	// メタプログラミング
	// プログラミング：何かを行うためにコードを書く
	// メタプログラミング：何かを解釈する方法を変更するためにコードを書く

	// コンストラクタ関数
	function Point2D(x,y){
		this._x = x;
		this._y = y;
	}

	var p2 = new Point2D(0,1);
	log("p2._x,p2._y",p2._x + "," + p2._y);

	// thisの参照をPoint2Dの呼び出しにバインドすることで
	// プロパティ生成コードのターゲットを変更
	function Point3D(x,y,z) {
		Point2D.call(this,x,y);
		this._z = z;
	}


	var p3 = new Point3D(10,-1,100);
	log("p3._x,p3._y,p3._z", p3._x + "," + p3._y + "," + p3._z);

	// メタプログラミングは関数型プログラミングとは相容れない
	// this参照の取り回し

	// 作用的プログラミング(Applicative programming)
	// 関数が持つ能力を全面的には活用しない
	// (e.g.) ある関数Bの引数として提供された関数Aを、
	//	関数Bを呼び出すことによって実行するようなプログラム
	// 『作用的』という言葉は文脈によって変わる

	var nums = [1,2,3,4,5];
	log("nums",nums);

	function doubleAll(array) {
		return _.map(array, function(n){return n*2});
	}

	log("_.map doubleAll",doubleAll(nums));

	function average(array) {
		var sum = _.reduce(array, function(a,b){return a+b});
		return sum / _.size(array);
		// _.size(list) length
		// _.size(obj) キーの数
	}
	log("_.reduce average",average(nums));

	function onlyEven(array) {
		return _.filter(array, function(n){
			return (n%2) == 0;
		});
	}
	log("_.filter onlyEven",onlyEven(nums));

	// _.map：	コレクションのそれぞれの値に対して関数を呼び出し、
	//		それらの結果を格納したコレクションを返す
	//
	// _.reduce：	コレクションのそれぞれの値に対して、その値とそれまでに計算された
	//		中間結果の値を引数として渡した関数を呼び、最終的にひとつの値を返す
	//
	// _.filter：	コレクションのそれぞれの値に対してプレディケート関数(真偽値を返す関数)
	//		を呼び、プレディケート関数がtrueを返した要素を新しいコレクションに格納して返す

	// コレクション中心プログラミング

	// _.map(array,fn(k,v,array){})
	// _.identity(value) valueをそのまま返す
	log("_.map({a:1,b:2},_.identity)", _.map({a:1,b:2},_.identity));

	// _keys(obj) object自身が持つ全てのプロパティ名を配列に格納して返す
	var result = _.map({a:1,b:2},function(k,v,coll){
		return [k, v, _.keys(coll)];
	});
	console.log("_.map(array,f(k,v,col))");
	log("result[0]", result[0]);
	log("result[1]", result[1]);

	//_.reduceRight
	var nums = [100,2,25];
	function div(x,y) {return x/y}
	log("_.reduce([100,2,25],div())",_.reduce(nums,div)); // (100 / 2/ 25)
	log("_.reduceRight([100,2,25],div())",_.reduceRight(nums,div)); // (25 / 2/ 100)

	// 結合的(associative) ： 加算や減算のように計算する順序を変えても結果が変わらないこと

	// 全てtrueでtrue
	// 一つでもfalseがあればfalse
	function allOff(/* 1つ以上の関数 */) {
		return  _.reduceRight(arguments, function(truth,f){
				return truth && f();
			},true);
	}

	// 全てfalseでfalse
	// 一つでもtrueがあればtrue
	function anyOff(/* 1つ以上の関数 */) {
		return _.reduceRight(arguments, function(truth,f){
			return truth || f();
		},false);
	}

	var T = function() {return true};
	var F = function() {return false};

	log("allOff()", allOff()); // true
	log("allOf(T,T)", allOff(T,T)); // true
	log("allOff(T,T,T,T,f)",allOff(T,T,T,T,F)); // false

	log("anyOff()", anyOff()); // false
	log("anyOf(T,T,T,F)", anyOff(T,T,T,F)); //true
	log("anyOff(F,F,F,F,F)",anyOff(F,F,F,F,F)); // false

	// 遅延評価を行う言語においては利点あり
	// JavaScriptには機能なし

	// _.find(array,predicate()) : プレディケート関数がtrueを返す最初の値を返す
	log("_.find(['a','b',3,'d',4],_.isNumber)", _.find(['a','b',3,'d',4],_.isNumber));

	// _.filter(array,predicate()) : プレディケート関数がtrueを返す値のコレクションを返す
	log("_.filter(['a','b',3,'d'],_.isNumber)", _.filter(['a','b',3,'d',4],_.isNumber));

	// _.reject(array,predicate()) : プレディケート関数がtrueを返す値を除いたコレクションを返す
	log("_.reject(['a','b',3,'d'],_.isNumber)", _.reject(['a','b',3,'d',4],_.isNumber));



	// 実際には以下の関数が真偽を逆転する
	function complement(pred) {
		return function() {
			return !pred.apply(null,_.toArray(arguments));
		}
	}

	// _.filterと組み合わせて_.rejectと同様の効果を得ることが出来る
	log("_.filter(['a','b',3,'d'],complement(_.isNumber))", _.filter(['a','b',3,'d',4], complement(_.isNumber)));

	// _.all(array,predicate()) : コレクションのすべての要素についてプレディケート関数がtrueを返した場合のみ
	// trueを返す
	log("_.all([1,2,3,4], _.isNumber)",_.all([1,2,3,4], _.isNumber));
	log("_.all([1,'a',3,4], _.isNumber)",_.all([1,2,'a',4], _.isNumber));

	// _.any(array,predicate()) : コレクションのいずれかの要素についてプレディケート関数がtrueを返した場合に
	// trueを返す
	log("_.any(['a','b','c','d'], _.isNumber)",_.any(['a','b','c','d'], _.isNumber));
	log("_.any([1,'a',3,4], _.isNumber)",_.any([1,2,'a',4], _.isNumber));

	// _.sortBy(collection,fn()) : 渡された関数の基準に応じてソートした結果を格納したコレクションを返す
	var people = [{name: "Rcik", age: 30},{name: "Jaka", age: 24}];

	log("_.sortBy(people, function(p){return p.age})",_.sortBy(people, function(p){return p.age}));
	_.each(_.sortBy(people, function(p){return p.age}), console.log);

	var albums = [{title:"Sabbath Bloody Sabbath",genre:"Metal"},
				  {title:"Scientist",genre:"Dub"},
				  {title:"Undertow",genre:"Metal"}];

	// _.groupBy(collection,fn()) : 渡された関数の返す値をキーとして、それぞれのキーを持った要素を子配列に格納して返す
	log("_.groupBy(albums, function(a){return a.genru})",_.groupBy(albums, function(a){return a.genre}));
	_.each(_.groupBy(albums, function(a){return a.genre}), console.log);

	// _.countBy(collection, fn()) : 渡された関数の返す値を基準値として、その基準値を持ったオブジェクトの数を数値として返す
	log("_.countBy(albums, function(a){return a.genru})",_.countBy(albums, function(a){return a.genre}));
	_.each(_.countBy(albums, function(a){return a.genre}), console.log);



});

$(function(){

	// Javascriptの癖の矯正
	function existy(x) {return x != null};
	function truthy(x) {return ( x != false) && existy(x)};

	// log
	function log(text1,text2) {
		console.log([text1,text2].join(" : "));
	}

	// 作用的関数を定義してみる ********************************

	// 作用的ではない関数の例 : 関数を引数にとっていない
	function cat(/* いくつかの配列 */){
		var head = _.first(arguments);
		if (existy(head))
			return head.concat.apply(head, _.rest(arguments));
		else
			return [];
	}
	log("cat([[1,2,3],[4,5],[6,7,8]])",cat([[1,2,3],[4,5],[6,7,8]]));

	// 作用的ではない関数の例 : 要素と配列を引数にとる
	function construct(head, tail){
		return cat([head],_.toArray(tail));
	}
	log("construct(42,[1,2,3])",construct(42,[1,2,3]));

	// 作用的な関数
	function mapcat(fun, coll) {
		return cat.apply(null, _.map(coll,fun));
	}

	result = mapcat(function(e) {
		return construct(e, [","]);
	},[1,2,3]);

	log("mapcat",result); // [1, ",", 2, ",",3 , ","]

	// 渡された配列の要素の間に指定された要素を加える
	// Array.slice(begin[,end]) : begin から end (ともに0から始まる添え字) endの直前まで取り出す
	//								endは負の数字を使って配列の終わりからのオフセットを表すことが出来ます。
	//                              e.g. slice(2, -1) : 配列の３番目の要素から、最後から２番目の要素までを取り出す
	function butlast(coll) {
		return _.toArray(coll).slice(0, -1); // 配列の頭から、最後から2番目の要素までを取り出す
	}

	function interpose(inter, coll) {
		return butlast(mapcat(function(e){
			return construct(e,[inter])
		},coll));
	}

	log("interpose(',',[1,2,3])",interpose(",",[1,2,3])); // [1, ",", 2, ",", 3]

	// 複数の関数が連鎖的に呼び出されて、それぞれの関数が少しずつデータ変換し、最後の解に至る



});

$(function(){

	// p57 2.2 データ思考

	// JavaScriptオブジェクトをデータマップとしてみなし、そのアクセスや操作を
	// 行うツールはJavaScriptにはほとんど提供されていない

	// _.keys _.values _.pluck *************************************************
	var  zombie = {name: "Bob", film: "Day of the Dead"};
	log("zombie",zombie);

	log("_.keys(zombie)", _.keys(zombie)); // ["name", "film"]
	log("_.values(zombie)", _.values(zombie)); // ["Bob","Day of the Dead"]

	// _.pluck( [オブジェクトの配列] , [文字列]) : 配列の要素として格納されているオブジェクト
	// それぞれに対して文字列でキーを検索し、その結果の値を配列に格納して返す

	result = _.pluck([{title: "Chthon",  author: "Anthony"},
			 {title: "Grendel", author: "Gardner"},
			 {title: "After Dark"}],
			 'author');
	log("_.pluck([{},{}],'key')", result); // ["Anthony", "Gardner", undefined]

	// _.pairs(obj) : オブジェクトを入れ子配列に変換 *******************************
	result = _.pairs(zombie);
	log("_.pairs(zombie)", result); // [["name","Bob"],["film","Day of the Dead"]]
	log("result[0]", result[0]); // ["name","Bob"]
	log("result[1]", result[1]); // ["film","Day of the Dead"]

	// _.object() : 配列をオブジェクトに再構築 *********************************
	result = _.object(_.map(_.pairs(zombie), function(pair){
		return [pair[0].toUpperCase(),pair[1]];
	}));
	log("_.object", result); // {FILM: "Day of the Dead", NAME: "Bub"}

	// _.inevrt(obj) : キーと値を入れ替える ***********************************
	log("_.invert(obj)", _.invert(zombie)); // {"Bob": "name", "Day of the Dead": "film"}

	// JavaScript ではオブジェクトのキーは絶対に文字列でなくてはならない
	log("_.keys(_.invert({a:123, b: 9}))", _.keys(_.invert({a:123, b: 9}))); // ['9','138']

	// オブジェクトが持つ値を埋める関数 **********************************
	result = _.pluck(_.map([
				{title:"aa", author: "kkk"},
				{title:"bb", author: "nnn"},
				{title:"cc"}
				],function(obj) {
					return _.defaults(obj, {author: "Unknown"}); // authorが設定されてないオブジェクトにデフォルト値を設定
				}), 'author');
	log("_.defaults", result); // ["kkk","nnn","Unknown"]

	// 非破壊的なフィルタリング(元の配列は変更されない)***********************
	// _.omit(obj[,'key'...]) : keyを省いたオブジェクトを返す(ブラックリスト)
	// _.pick(obj[,'key'...]) : key以外を省いたオブジェクトを返す(ホワイトリスト)
	var person = {name: "Romy", token: "j23983ij", password: "tigress"};
	var info = _.omit(person, 'token', 'password');
	log("_.omit", info); // {name: "Rommy"}
	var creds = _.pick(person, 'token', 'password');
	log("_.pick", creds); // {password: "tigress", token: "j23983ij"}

	// セレクタ関数 *********************************************************
	// _.findWhere([obj,..], obj) : オブジェクト配列と検索基準オブジェクトを引数に取り最初にマッチしたオブジェクトを返す
	// _.where([obj,..], obj) : マッチしたすべてのオブジェクトの配列を返す

	var library = [
			{title: "SICP", isbn: "0262010771", ed: 1},
			{title: "SICP", isbn: "0262510871", ed: 2},
			{title: "Joy of Clojure", isbn: "1935182641", ed: 1}
		];

	log("_.findWhere",_.findWhere(library, {title: "SICP", ed: 2}));
	// {title: "SICP", isbn: "0262510871", ed: 2}

	log("_.where",_.where(library, {title: "SICP"}));
	// [{title: "SICP", isbn: "0262010771", ed: 1},
	// {title: "SICP", isbn: "0262510871", ed: 2}]

	// p61 2.2.1 「テーブルのような」データ *********************************
	// 「擬似SQL」レベルの関数定義

	var library = [
			{title: "SICP", isbn: "0262010771", ed: 1},
			{title: "SICP", isbn: "0262510871", ed: 2},
			{title: "Joy of Clojure", isbn: "1935182641", ed: 1}
		]; // JavaScript オブジェクトの配列をデータテーブルとしてみる

	_.pluck(library,'title');
	// ["SICP", "SICP", "Joy of Clojure"]
	// SELECT title FROM library と同等の効果ではあるが
	// 結果がテーブルデータの形を維持していない

	// 次に定義するproject関数はテーブルの形を維持
	function project(table, keys) {
		return _.map(table, function(obj){
			return _.pick.apply(null, construct(obj, keys));
		});
	};

	var editionResults = project(library, ['title', 'isbn']);
	log("editionResults", editionResults);
	// [{title: "SICP", isbn: "0262010771"},
	//  {title: "SICP", isbn: "0262510871"},
	//  {title: "Joy of Clojure", isbn: "1935182641"}]

	// このデータに再度project関数を適用してもう一段階処理できる
	var isbnResults = project(editionResults,['isbn']);
	log("isbnResults", isbnResults);
	// [{isbn: "0262010771"},{isbn: "0262510871"},{isbn: "1935182641"}]

	// 最後に欲しいデータだけ抽出するために、意図的にデータテーブルの構造を壊します
	 log("result", _.pluck(isbnResults, 'isbn'));
	// ["0262010771","0262510871","1935182641"]
	// このようなデータ構造の意図的な破壊によるデータの抽出は、あるモジュールから
	// 別のモジュールにデータを「引き渡す」ための操作

	// 関数型プログラマーは、
	// ・データの内
	// ・発生するデータの変換
	// ・異なるレイヤーに引き渡すためのデータのフォーマット
	// について深く考える

	// データ行に別名をつける ***********************************************
	// SELECT ed AS edition FROM library;

	// マップデータで指定する通りにキーをリネームするユーティリティー関数を作成
	// _.reduce(list, iteratee, [memo], [context]) : reduce boils down alist of values into a single value
	//                                               MEMO is the initial state of the reduction
	function rename(obj, newNames) {
		return _.reduce(newNames, function(o, nu, old) {
			if(_.has(obj,old)) {
				log("argument[0]", o);   // {b: 2} : accumulator
				log("argument[1]", nu);  // AAA    : value
				log("argument[2]", old); // a      : key
				o[nu] = obj[old]; // {b:2} に"AAA":"1" を追加
				return o;
			} else {
				return o;
			}
		},
		_.omit.apply(null, construct(obj, _.keys(newNames)))); // function(o, nu, old)の最初のメモとして_.omitされたリストが渡される
															   // 今回は_.omit({a:1, b:2},'a') => {b:2}
	}

	// rename関数の実装に当たっての重要なポイント
	// オブジェクトを再構成するために、_.reduce関数を使っている。
	// _.reduce関数で累積される変数の「マップデータらしさ」を維持しつつ。キー値ペアを走査している。

	// _.reduce引数関数に渡されるmemo 配列が渡された場合
	var sumPlusOne = _.reduce([1,2,3], function(memo, num, x){
			// log("argument[0]", memo); // 1 2 4 : accumulator
			// log("argument[1]", num); //  1 2 3 : value
			// log("argument[2]", x); //    0 1 2 : argumentNo
			return memo + num;
		},1 /* initial state of accumulator */);
	log("memo : ", sumPlusOne); // => 7

	log("rename", rename({a:1, b:2}, {'a':'AAA'})); // {AAA:1, b:2}

	// rename関数を使って、as関数を実装
	function as(table, newNames) {
		return _.map(table, function(obj){
			return rename(obj, newNames);
		});
	}

	log("as(library, {ed: 'edition'})", as(library, {ed: 'edition'}));
	// => [{title: "SICP", isbn: "0262010771", edition: 1},
	//	   {title: "SICP", isbn: "0262510871", edition: 2},
	//	   {title: "Joy of Clojure", isbn: "1935182641", edition: 1}]

	// project関数とas関数を組み合わせる
	log("project(as(),[])", project(as(library, {ed: 'edition'},['edition'])));
	// => [{edition: 1},{edition: 2},{edition: 1}]

	// WHERE句と同様の働きをする関数
	function restrict(table, pred) {
		return _.reduce(table, function(newTable, obj){
			if(truthy(pred(obj)))
				return newTable;
			else
				return _.without(newTable, obj); // _.without(array, *values) : Returns a copy of the array with all instances of the values removed
		}, table);
	}

	restrict(library, function(book){
		return book.ed > 1;
	}); // =>  [{title: "SICP", isbn: "0262510871", ed: 2}]

	restrict(
		project(as(library,{ed: 'edition'}),['title','isbn','edition']),
		function(book){
			return  book.edition > 1;
		}
	);
	// => [{title: "SICP", isbn:"0262510871", edition: 2}]
	// キー名変更     as: ed -> edition
	// セレクト  project: title,isbn,edition列を取得
	// 制約適用 restrict: edition >1

	// project,as,restrict は同じテーブル抽象型(オブジェクトの配列)に対して動作する
	// これがデータ思考である

	// p66 2.3 まとめ
	//
	// 第一級関数とは
	// ・変数に格納することができる
	// ・配列の要素として格納することができる
	// ・オブジェクトのフィールドに格納することができる
	// ・必要に応じて生成することができる
	// ・他の関数の引数として渡すことができる
	// ・関数の戻り値として返されることができる
	//
	// 作用的プログラミングとは
	// ・ある関数Bの引数として提供された関数Aを、関数Bを呼び出すことによって実行させるようなプログラミング
	// ・文脈によって意味は変わる

});

$(function(){
	// p69 ３章 JavaScriptにおける変数のスコープとクロージャ

	// バインディング : ある値をある名前に関連付ける動作

	// JavaScriptにおいては以下のポイントでバインディングが行われる
	// ・varキーワードを使った変数の定義
	// ・関数の引数
	// ・thisの設定
	// ・プロパティのアサイン

	// クロージャ : 生成時に関連する変数バインディングを補足する関数

	// JavaScriptにおけるスコープ
	// ・thisバインディングの値
	// ・thisバインディングの値によって定義される実行コンテクスト
	// ・変数の「生存期間」
	// ・変数値の解決の仕組み、もしくは静的スコープ

	// ここでは、変数を解決する仕組みの概念をスコープと呼ぶ

	//******************************************************************************************
	// p70 3.1 グローバルスコープ **************************************************************

	// varキーワードを伴わない変数の宣言はグローバルスコープに生成される

	// 暗黙的にグローバルスコープに存在してしまう場合
	function makeEmptyObject(){
		return new Object();
	}
	// プログラム上でやり取りされる可変オブジェクトはいずれも、プログラムのどこからでも
	// プロパティに変更を加えることが出来る

	//******************************************************************************************
	// p72 3.2 静的スコープ ********************************************************************

	// 静的スコープ(lexical scope) lexical:語彙を形成する、語彙の
	// 変数とその値を参照できる範囲のこと
	// 一番近いバインディングコンテクスト（スコープ）から始まって、バインディングを発見するまで
	// 外側にルックアップ対象を広げる

	// JavaScriptの変数ルックアップ
	// 静的スコープ、thisの解決、関数スコープ、whithブロック


	//******************************************************************************************
	// p73 3.3 動的スコープ ********************************************************************

	// 動的スコープ(dynamic scope)
	// 動的スコープの仕組みの再現
	var globals = {};

	// 「名前と名前に紐ついている値のペアを格納したグローバルなテーブルである」とした
	// 思想に基づいて構築されている。（動的スコープを実装する方法のうちの１つ）

	// 動的スコープのシミュレーション
	function makeBindFun(resolver) {
		return function(k, v){
			var stack = globals[k] || [];
			globals[k] = resolver(stack, v);
			return globals;
		};
	}

	var stackBinder = makeBindFun(function(stack,v){
		stack.push(v);
		return stack;
	});

	var stackUnbinder = makeBindFun(function(stack){
		stack.pop();
		return stack;
	});

	var dynamicLookup = function(k) {
		var slot = globals[k] || [];
		return _.last(slot);
	}

	// シミュレーションを試す
	stackBinder('a',1);
	stackBinder('b',100);

	log("dynamicLookup('a')",dynamicLookup('a')); // 1
	globals; // => {'a': [1], 'b': [100]}

	// 'a'に２つ目の値をプッシュ
	stackBinder('a','+');
	log("dynamicLookup('a') a push '+'",dynamicLookup('a')); // '+'
	globals; // => {'a': [1,'+'], 'b': [100]}

	// 変数のアンバインド
	stackUnbinder('a');
	log("dynamicLookup('a') a pop ",dynamicLookup('a')); // '1'
	globals; // => {'a': [1], 'b': [100]}

	// 発生する問題
	function f() { return dynamicLookup('a'); }
	function g() { stackBinder('a','g'); return f();}
	log("f()",f()); // => 1
	log("g()",g()); // => g
	globals; // => {a: [1,"g"], b:[100]}

	// f関数自身はaのバインディングを一切操作していないのにもかかわらず、
	// f関数が返す値はこれを呼び出す関数gによって決まってしまう

	// このコードでは明示的にアンバインドする必要があるが
	// 通常はダイナミックバインドのコンテクストが閉じられる際に自動的にアンバインドされる

	// p77 3.3.1 JavaScriptにおける動的スコープ

	// this参照の値は呼び出す者によって決定される
	function globalThis() { return this; }

	log("globalThis()", globalThis()); // Window

	log("globalThis.call('barnabas')", globalThis.call('barnabas')); // 'barnabas'

	log("globalThis.apply('orsulak',[])", globalThis.apply('orsulak',[])); // 'orsulak'

	// 混乱のもとになる

	// _.bind(function, object, [*arguments]) : 関数functionをオブジェクトobjectにバインドした関数を返す
	//                                          返された関数はどのコンテクストで呼ばれてもthisの値として
	//                                          objectを参照した状態で実行する
	var nopeThis = _.bind(globalThis, 'nope');
	log("nopeThis.call('wat')", nopeThis.call('wat'));

	// this参照は動的スコープをもつため、ボタンクリックなどのイベントハンドリング関数では特にthis参照の値が使いづらい

	// _.bindAll(object, *methodNames) : methodNamesで指定されたメソッドを、常にobjectにバインドしどこで実行してもそれを
	//                                   thisとして実行するようになる
	var target = {
		name: '正しい値',
		aux: function() {return this.name;},
		act: function() {return this.aux();}};

	// log("target.act.call('wat')", target.act.call('wat'));
	// => Erro オブジェクトは'aux'プロパティまたはメソッドをサポートしていません

	_.bindAll(target,'aux','act');
	log("target.act.call('wat')", target.act.call('wat')); // => '正しい値

	//******************************************************************************************
	// p79 3.3 関数スコープ ********************************************************************

	// 関数スコープ(function scope)
	// グローバルハッシュテーブルに格納されたバインディングにアクセスする代わりに、
	// 可能な限り小さなエリア(つまり関数)に制限されることを強制される。

	function strangeIdentity(n) {
		// 意図的に変なコード
		for(var i = 0; i < n; i++);
		return i;
	}
	log("strangeIdentity", strangeIdentity(138)); // => 138

	// JavaScript にはブロックスコープが存在しないため、変数iは関数スコープ内において
	// 自由にアクセス可能です。

	// varを伴って宣言される変数は宣言された関数の最初まで巻き上げられる！

	function strangeIdentity(n) {
		// 意図的に変なコード
		var i;
		for(i = 0; i < n; i++);
		return i;
	}
	log("strangeIdentity", strangeIdentity(138)); // => 138

	// this参照を遣った関数スコープのシュミレート
	function strangeIdentity(n) {
		for(this['i'] = 0; this['i'] < n; this['i']++);
		return this['i'];
	}
	log("strangeIdentity", strangeIdentity(138)); // => 138
	log("i", i); // => 138
	// thisを使ってグローバルオブジェクトを編集してしまった！

	// 空のオブジェクトをthis参照にバインド
	log("strangeIdentity.call({},10000)", strangeIdentity.call({},10000)); // => 10000
	log("i", i); // => 138 // グローバル変数は編集されていない

	// このコードでは関数内のローカル変数にしかアクセスできない
	// glabalsに格納されている擬似グローバル変数にアクセスできない

	// globalsのクローンを渡す
	function f() {
		this['a'] = 200;
		return this['a'] + this['b'];
	}

	var globals = {'b': 2};

	log("f.call(_.clone(globals))",f.call(_.clone(globals))); // 202
	log("globals.b", globals.b); // 2 グローバルコンテクストは変更されていない

	// _.clone(obj) : オブジェクトobjを浅くコピーしたものを返す。
	// 入れ子になっているオブジェクトや配列は参照がコピーされ、それらの実体は複製されない

	//******************************************************************************************
	// p83 3.5 クロージャ **********************************************************************

	// クロージャとは、それが生成された場所近辺の値を「確保する」関数のこと

	// p84 3.5.1 クロージャをシミュレート
	// クロージャとは、自身が定義されたスコープに存在する外部のバインディングを、そのスコープの
	// 実行完了後にも使用するために確保している関数のこと

	// クロージャの一番シンプルな例
	// ローカル変数を後に利用できるよう確保している第一級関数
	function whatWasTheLocal() {
		var CAPTURED = "あ、こんにちは。";
		return function() {
			return "ローカル変数:" + CAPTURED;
		};
	}
	var reportLocal = whatWasTheLocal();
	log("reportLocal()", reportLocal()); // => "ローカル変数:あ、こんにちは。"
	// ローカル変数CAPTUREDがクロージャとともに返されます

	// 関数に渡した引数も確保する
	function createScaleFunction(FACTOR) {
		return function(v) {
			return _.map(v,function(n) {
				return (n * FACTOR);
			});
		};
	}
	var scale10 = createScaleFunction(10);
	log("scale10([1,2,3])",scale10([1,2,3])); // => [10,20,30]
	// createScaleFunction関数が終了した時点で生存期間を終えるはずのFACTOR変数を参照しているように見える
	// 実際はcreateScaleFunctionによって返された関数が実行されるたびにいつでもアクセスできるように、
	// 返された関数の実行部に確保されている
	// この変数の確保がまさにクロージャの定義そのものである

	// thisをしようする関数スコープのシミュレータを参考にしたクロージャシミュレート
	function createWeirdScaleFunction(FACTOR) {
		return function(v) {
			this['FACTOR'] = FACTOR;
			var captures = this;
			return _.map(v, _.bind(function(n){
				return (n * this['FACTOR']);
			}, captures));
		};
	}

	var scale10 = createWeirdScaleFunction(10);
	log("scale.Call({},[5,6,7])",scale10.call({},[5,6,7]));

	//******************************************************************************************
	// p87 3.5.1.1 自由変数

	// 自由変数 : もしある関数が内側に関数を持っている場合、この(外側の)関数に定義されている変数は
	//            内側関数から参照することができる。これらの変数のこと。

	function makeAdder(CAPTURED) {
		return function(free) {
			return free + CAPTURED;
		};
	}
	var add10 = makeAdder(10);
	log("add10(100)",add10(100)); // => 110

	// 加算を行う内側の関数がCAPTURED変数を自身のスコープで宣言せず、かつ自身のスコープでその変数（自由変数）を
	// 参照しているため、CAAPTURED変数が確保される

	var add1024 = makeAdder(1024);
	log("add1024(11)",add1024(11)); // => 1035
	log("add10(100)",add10(98)); // => 108

	// CAPTURED変数の参照先は返された加算関数毎に異なる

	// クロージャは、関数も含めてどのようなデータ型でも確保することができる

	// 引数に渡された関数を確保してその関数が返す値と与えた値の平均値を計算する
	function averageDamp(FUN) {
		return function(n) {
			return average([n, FUN(n)]);
		};
	}
	var averageSq = averageDamp(function(n) { return n * n;});
	log("averageSq(10)", averageSq(10)); // => 55 : (10 + 10*10) / 2

	// p88 3.5.1.2 シャドウイング

	// JavaScriptにおけるシャドウイング : 同じ名前の変数が一段階内側の関数スコープで宣言される場合に発生
	var shadowed = 0;
	function varShadow() {
		var shadowed = 4320000;
		return ["値は", shadowed].join(' ');
	}
	log("shadowed : ", varShadow()); // => "値は 4320000"
	// バインディングのルックアップは内側から行われる

	// 関数のパラメータ名が絡んでくる場合
	var shadowed = 0;
	function argShadow(shadowed) {
		return ["値は", shadowed].join(' ');
	}
	log("argShadow(108)",argShadow(108)); // "値は 108"
	log("argShadow()",argShadow()); // "値は "
	// パラメータがグローバルスコープで宣言された同じ名前の変数を隠している

	// シャドウイングによる混乱を避けるために変数命名に気をつける

	//******************************************************************************************
	// p90 3.5.2 クロージャの使用例

	function complement(PRED) {
		return function() {
			return !PRED.apply(null, _.toArray(arguments));
		};
	}
	// プレディケート関数PREDはreturnで返される関数によって確保されている
	function isEven(n) { return(n%2) == 0;}
	var isOdd = complement(isEven);

	log("isOdd(2)",isOdd(2)); // => false
	log("isOdd(431)", isOdd(431)); // => true

	// isOddを定義した後にisEven関数の定義が変更された場合
	function isEven(n) { return false;}
	// この変更はisOdd関数に影響を及ぼすか？
	log("isOdd(31) after isEven changed", isOdd(31)); // => true

	// クロージャに確保された変数は、クロージャが生成された時点で確保した参照をつかんでいる

	function showObject(OBJ) {
		return function() {
			return OBJ;
		};
	}
	var o = {a: 42};
	var showO = showObject(o);
	showO(); // => {a: 42}

	o.newField = 108;
	showO(); // => {a: 42, newField:108}

	// オブジェクトoへの参照はクロージャの内部と外部の両方に存在するため、
	// 変更が適用されてしまう

	// 確保された変数をプライベートデータとして使う
	var pingpong = (function() {
		var PRIVATE = 0;
		return {
			inc: function(n) {
				return PRIVATE += n;
			},
			dec: function(n) {
				return PRIVATE -= n;
			}
		};
	})();
	log("pingpong.inc(10)",pingpong.inc(10)); // => 10
	log("pingpong.dec(3)",pingpong.dec(3)); // => 7
	log("pingpong.inc(6)",pingpong.inc(6)); // => 13
	// 2つのクロージャに確保されているPRIVATE変数は、これらの2つのクロージャを呼び出す以外にアクセスする方法がない

	//******************************************************************************************
	// p93 3.5.3 抽象としてのクロージャ

	// 配列やオブジェクトのような連想構造に対してキーを指定すると、対応する値を返す関数を生成する関数
	function plucker(FIELD) {
		return function(obj) {
			return (obj && obj[FIELD]);
		};
	}

	var bestNovel = {title: "Infinite Jest", author:"DFW"};
	var getTitle = plucker('title');
	log("getTitle(bestNovel)", getTitle(bestNovel)); // => Infinite Jest
	// obj のキー'title' の値を表示

	var books = [{title: "Chthon"},{stars: 5},{title: "Botchan"}];
	var arry = ["Chthon",5,"Botchan"];
	var third = plucker(2);
	log("third(books)",third(books)); // => {title: "Botchan"}  (配列添え字の[2]を表示)
	log("third(arry)",third(arry)); // => "Botchan"  (配列添え字の[2]を表示)

	// _.filter(obj, pred) : と組み合わせる
	_.filter(obj, getTitle); // => [{title: "Chthon"},{title: "Botchan"}]

	//******************************************************************************************
	// p94 3.6 まとめ **************************************************************************

	// 変数のスコープとクロージャ
	//
	// グローバルスコープ
	// 静的スコープ
	// 関数スコープ
	//
	// this参照の使用方法と動作
	// _.bind関数や_.bindAll関数を使って特定の値に固定
	//
	// 自分が定義する関数にクロージャを使用する
	// 既存の関数を「微調整」して新しい抽象を得るためにクロージャを使用する

});

$(function(){
	// p97 ４章 高階関数(higher-oder function)

	// 高階関数(higher-oder function)
	// ・第一級データ型である
	// ・引数として関数をとる
	// ・関数を戻り値として返す

	//******************************************************************************************
	// p97 4.1 引数として関数をとる関数 ********************************************************

	//******************************************************************************************
	// p98 4.1.1 関数を渡すことを考える : max、finder、best
	log("_.max([1,2,3,4,5])", _.max([1,2,3,4,5])); // => 5
	log("_.max([1,2,3,4.4,4.35])", _.max([1,2,3,4.4,4.35])); // => 4.4

	// 数値の配列ではなく、オブジェクトの配列から最大値を求めたい場合は？
	// ２つめの引数にオブジェクトから数値を生成する関数を渡す
	var people = [{name: "Fred", age: 65},{name: "Lucy", age: 36}];
	_.max(people, function(p) { return p.age}); // => {name: "Fred", age: 65}
	// 最大値ではなく、最大値を持つオブジェクトが返る

	// ******************************
	// オブジェクト型アプローチだと
	// オブジェクトに数値を返すメソッドを付与
	// コレクションループで数値のコレクションを作成
	// 最大値の添え字を取得
	// 添え字からオブジェクトコレクション内のオブジェクトを取得
	// ******************************


	// 任意のオブジェクト同士を比較する手段を提供している

	// _.maxは常に比較演算子 > を使って比較を行うので、本当の意味で関数型であるとはいえない

	// finder(fn1, fn2, coll) を定義する
	// fn1 : 比較可能なデータとしての値を作る関数
	// fn2 : ２のつ値を比較してそこから「良い」値を返す関数
	function finder(valueFun, bestFun, coll) {
		return _.reduce(coll, function(best, current){
			var bestValue = valueFun(best);
			var currentValue = valueFun(current);
			return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
		});
	}
	log("finder(_.identity, Math.max, [1,2,3,4,5])", finder(_.identity, Math.max, [1,2,3,4,5])); // => 5
	// _.identityを充てることでただの値を「関数が計算した」値として使用できる

	log("finder(plucker('age'), Math.max, people)", finder(plucker('age'), Math.max, people)); // => {name: "Fred", age: 65}
	var returnL = function(x,y){return (x.charAt(0) === "L") ? x : y}
	log("finder(plucker('name'), returnL, people)", finder(plucker('name'), returnL, people)); // => {name: "Lucy", age: 36}
	// 'L'始まりの名前がなければ最後のオブジェクトが変える

	// 4.1.1.1 finder関数を少し引き締める

	// ロジックを複製している部分がある
	// finder関数自身の実装と、「最良の値を探す」比較ロジックを提供した第一級関数の類似性

	// finder関数内
	// return (bestValue === bestFun(bestValue, currentValue)) ? best : current);
	//
	// 「最良の値を探す」bestFun関数内
	// return (x.charAt(0) === "L") ? x : y;

	// 以下の２つの想定にもとづいてfinder関数の実装を引き締めることができる
	// ・最良の値を判定する関数は、最初の引数が２つ目の引数よりも良い場合にtrueを返す
	// ・最良の値を判定する関数は、渡された引数を比較できる形まで「紐解く」方法を知っている

	function best(fun, coll) {
		return _.reduce(coll, function(x, y){
			return fun(x,y) ? x: y;
		});
	}
	var large = function(x,y) {return x > y};
	log("best(large,[1,2,3,4,5])", best(large,[1,2,3,4,5])); // => 5


	//******************************************************************************************
	// p101 4.1.2 関数を渡すことをさらに考える : repeat、repeatedly、iterateUntil

	// 全項では２つの関数を引数に取るfinderを、渡される関数に事前に想定されている事項を実装することで
	// 引数を１つ減らしシンプルな実装のbest関数にたどりついた

	// 複数の関数を引数に取ることが完全に正当化できる場合もある

	// repeat、repeatedly、iterateUntilをより一般的な関数に作り変える方法と
	// その手直しにより発生するトレードオフを見る

	// repeat(times, value) : ある数値と値を引数に取り、その値を数値の数だけ要素として格納した配列を返す
	function repeat(times, VALUE) {
		return _.map(_.range(times), function(){ return VALUE; });
	}
	log("repeat(4,'Major')", repeat(4,'Major')); // ["Major","Major","Major","Major"]

	// p102 4.1.2.1 値ではなく、関数を使え

	// ある値を繰り返す関数 -> ある計算を繰り返す関数

	function repeatedly(times, fun) {
		return _.map(_.range(times), fun);
	}
	var result = repeatedly(3, function() {
		return Math.floor((Math.random()*10) + 1);
	});
	log("random repeat 3", result); // => [4,9,7] ランダムな値

	var result = repeatedly(3, function() {
		return "Odelay!!";
	});
	log("fixed value repeat 3", result); // => ["Odelay!!","Odelay!!","Odelay!!"]

	var result = repeatedly(3, function(n) {
		var id = 'id' + n;
		$('body').append($("<p>Odelay!</p>").attr('id',id));
		return id;
	});
	log("DOM output", result); // ['id0','id1','id2'] (<body>タグ内に'Odelay!'が３回かかれる)

	// 関数の「外の世界」に変更を加えてしまう
	// 副作用を含むこのような関数は潜在的に問題を抱えている

	// p103 4.1.2.2 「値ではなく、関数を使え」と言いました

	// 繰り返し回数を値で渡していた…
	// 与えられた関数を呼びその関数が返す値が、ある条件を満たすまで繰り返したい

	function iterateUntil(fun, check, init) {
		var ret = [];
		var result = fun(init)
		while(check(result)){
			ret.push(result);
			result = fun(result);
		}
		return ret;
	};

	// 実行例
	var result = iterateUntil(function(n) {return n+n;},
					function(n) {return n <= 1024; },
					1);
	log("2 ~ 1024 までの倍数", result); // [2,4,6,16,32,64,128,256,512,1024]

	// 同じ動作をrepeatedlyで実行するためには繰り返し回数を把握しておく必要がある
	repeatedly(10,function(exp){ return Math.pow(2,exp+1); });
	log("2 ~ 1024 までの倍数", result); // [2,4,6,16,32,64,128,256,512,1024]

	//******************************************************************************************
	// p97 4.2 他の関数を返す関数 **************************************************************

	// 定数を返す関数
	// 一般的には「k」と呼ばれる、ここでは分かりやすく「always」と呼ぶ
	function always(VALUE) {
		return function() {
			return VALUE;
		};
	};

	var f = always(function(){});
	log("f() === f()", f() === f()); // => true
	// 関数は常にユニークなものを返すが、VALUE変数にバインドされている戻り値は常に同じもの

	var g = always(function(){});
	log("f() === g()", f() === g()); // => false
	// 新しく生成された複数のクロージャはそれぞれが異なる値を返す

	// クロージャの特徴を押さえる

	// alwaysを無名関数の代わりとして使用する
	var result = repeatedly(3,always("Odelay!"));
	log("repeatedly(3,always('Odelay!')", result); // ["Odelay!!","Odelay!!","Odelay!!"]

	// 関数を返す関数の例
	// メソッドを引数に取り、ターゲットとなるオブジェクトでそのメソッドを実行する関数を返す
	function invoker(NAME, METHOD) {
		return function(target /* 任意の数の引数 */) {
			if(!existy(target)) fail("Must provide a target");

			log("target", target); // [1,2,3]

			var targetMethod = target[NAME];
			log("targetMethod", targetMethod); // function reverse(){ ... }

			var args = _.rest(arguments);
			log("rest arguments", args); // [0,1,2,3]  <- 0,[[1,2,3]] フラットにされている 0:添え字 [[1,2,3]]:オブジェクトそのもの

			var isValidMethod = (existy(targetMethod) && METHOD === targetMethod);
			var actionFun = function() { return targetMethod.apply(target, args);}
			return doWhen(isValidMethod, actionFun); // doWhen(cond,action) : cond == true で action()結果を返す
		};
	};

	var rev = invoker('reverse', Array.prototype.reverse);

	log("_.map([[1,2,3]],rev)" ,_.map([[1,2,3]],rev)); // => [[3,2,1]]

	_.map([4,5,6],
		function(t,k,o) {
			log("args",_.rest(arguments)); // [0,4,5,6] [1,4,5,6] [2,4,5,6]
		}
	);

	var result = Array.prototype.reverse.apply([1,2,3], [1] );
	log("result",result); // 3,2,1

	// あるインスタンスに対して直接メソッドを呼び出すのではなく
	// 関数型スタイルでは実行ターゲットとなるオブジェクトを引数に取る関数を好む

	// オブジェクトが該当メソッドを持っていない場合にundefinedを返すというinvokerの特徴を使って
	// JavaScriptに備わっているポリモーフィズムを利用し、ポリモーフィック関数を構築できる

	//******************************************************************************************
	// p108 4.2.1 引数を高階関数に確保する

	// 高階関数に渡す引数は返される関数の「設定項目」であると考える
	// 値を渡し返される関数では出来ることが限られる
	// 変数を確保した関数を返す関数

	//******************************************************************************************
	// p108 4.2.2 大儀のために変数を確保する

	// ユニークな文字列を生成する関数が必要だとする
	// 単純に実装してみる
	function uniqueString(len) {
		return Math.random().toString(36).substr(2,len);
	}
	log("uniqueString(10)", uniqueString(10)); // => '44dk5b7hpz'
	// 仕様変更 指定された文字列を先頭に含む文字列を生成する
	function uniqueString(prefix) {
		return [prefix, new Date().getTime()].join('');
	}
	log("uniqueString('argento')", uniqueString('argento')); // => 'argento1477375580303'
	// 仕様変更 末尾に連番を付す
	// 末尾の連番のための値を保持するクロージャを組み入れる
	function makeUniqueStringFunction(start) {
		var COUNTER = start;
		return function(prefix) {
			return [prefix, COUNTER++].join('');
		};
	};

	var uniqueString = makeUniqueStringFunction(0);
	log("uniqueString('dari')",uniqueString('dari')); // => "dari0"
	log("uniqueString('dari')",uniqueString('dari')); // => "dari1"
	log("uniqueString('joy')",uniqueString('joy'));   // => "joy2"

	// 同じ機能をオブジェクトを使って実現できるか
	var generator = {
		count: 0,
		uniqueString: function(prefix) {
			return [prefix, this.count++].join('');
		}
	};
	log("generator.uniqueString('bohr')",generator.uniqueString("bohr")); // => bohr0
	log("generator.uniqueString('bohr')",generator.uniqueString("bohr")); // => bohr1

	// このケースの弱点
	// countプロパティに値を再代入
	generator.count = "gotcha";
	log("generator.uniqueString('bohr')",generator.uniqueString("bohr")); // => bohrNaN

	// 動的にバインド
	var result = generator.uniqueString.call({count: 1337}, "bohr");
	log("generator.uniqueString.call({count: 1337}, 'bohr')", result); // => bohr1337
	log("generator.uniqueString.call({count: 1337}, 'bohr')", result); // => bohr1337

	// JavaScriptの秘密のレシピによってgeneratorのカウンタを隠蔽することも可能
	var omgenerator = (
		function(init) {
			var COUNTER = init;
			return {
				uniqueString: function(prefix) {
					return [prefix, COUNTER++].join('');
				}
			};
		}
	)(0);

	var result = omgenerator.uniqueString("lickhing-");
	log("omgenerator.uniqueString('lickhing-')", result); // => lichking-0

	// クロージャを使う方法はクリーンでシンプル
	// しかし同時に恐怖もはらんでいる。

	//*******************************************
	// p111 4.2.2.1 値の差異に注意 **************

	// クロージャによって確保された変数が内在することで招かれる混乱

	// 参照透過性(referential transparency) : 関数が返す結果の値がその引数のみによって左右される状態
	//                                        関数呼び出しをその関数が返すと期待される値でそのまま置き換えても
	//                                        プログラムを壊すことがない状態
	//
	// makeUniqueStringFunction関数の実行結果は、それ以前に実行された回数に完全に依存している
	// このような関数は絶対に必要な場合を除いては避けるべき

	//******************************************************************************************
	// p108 4.2.3 存在しない状態に対する防御のための関数: fnull

	// fnullが解決すべき状況
	var nums = [1,2,3,null,5];
	var result = _.reduce(nums, function(total, n) { return total*n});
	log("nullを含む配列のreduce", result); // => 0

	// doSomething({whoCares: 42, critical: null}); //

	// fnullの実装
	function fnull(fun /* , (1つ以上の)デフォルト値 */) {
		var defaults = _.rest(arguments);
		return function(/* args */) {
			var args = _.map(arguments, function(e, i){
				return existy(e) ? e: defaults[i];
			});
			return fun.apply(null, args);
		};
	};
	// 与えられた関数の実行を行う前にその引数にnullもしくはundefinedが入っていないかどうかを確認し、
	// いずれかが見つかった場合はこれらをデファルトの値に置き換えて、新しい引数を使って元の関数を実行する。
	//
	// 引数をマッピングしてチェックするコストが発生するのは、fnullによって保護された関数が実際に呼ばれる時だけ
	// デフォルト値の代入は必要な時が来るまで「遅延」される
	var safeMult = fnull(function(total, n) {return total * n;}, 1, 1);
	log("_.reduce(nums, safeMult)", _.reduce(nums, safeMult)); // => 30
	// fnullが生成した関数を実行する際に渡される引数の数が、デフォルト引数として渡した引数の数よりも少ない場合
	// デフォルトの値に置き換えない
	var unSafeMult = fnull(function(total, n) {return total * n;}, 1, 5);
	log("_.reduce([null,null,1], unSafeMult)",_.reduce([null,null,1], unSafeMult)); // => 5
	log("_.reduce([null,null,1,null], unSafeMult)",_.reduce([null,null,1,null], unSafeMult)); // => 25
	log("_.reduce([null,null,1,null,null], unSafeMult)",_.reduce([null,2,null,4,null], unSafeMult)); // => 200

	// unSafeMultは引数を２つ取る(total, n) totalのデフォルト値が１、ｎのデフォルト値が５
	// つまりデフォルト値に設定する引数の数は２つで良い、デフォルト値が機能してる場合
	// unSafeMultにおいては一つ目の引数のデフォルト値は配列の１番目にしか適用されない

	function defaults(df)  {
		return function(obj, key) {
			var val = fnull(_.identity, df[key]);
			return obj && val(obj[key]);
		};
	}

	function doSomething(config) {
		var lookup = defaults({critical:108, secondly: 30});
		return lookup(config, 'secondly');
	}

	log("doSomething({critical:9})",doSomething({critical:9, secondly:40})); // => 9
	log("doSomething({})",doSomething({})); // => 108

	// これによって関数の最初に長々と続くo[k] || someDefaultのような防御パターンを避けることが出来る

	// defaults関数は配列要素への直接のアクセスに対して一枚レイヤーを提供するために便利な関数を返します

	//******************************************************************************************
	// p114 4.3 すべてを集結 : オブジェクトバリデータ ******************************************

	// 任意の基準にもとづいてオブジェクトの妥当性を検証するソリューション
	// e.g. 外部からの命令をJSONオブジェクトとして受け取るアプリケーションを作っているところを想像
	var json = {message: "Hi!", type: "display", from: "http://localhost:8080/node/frob"};

	// このようなメッセージの妥当性を検証するために、オブジェクトのフィールドを単純に走査して検証するよりも
	// 手軽な手段があれば便利

	// 欲しいもの
	// より「流暢」である
	// パーツから構成することができる
	// 与えられたコマンドオブジェクトから発生したすべてのエラーを報告してくれるようなもの

	// 与えられたそれぞれのプレディケート関数がfalseを返すとき
	// それぞれのエラーメッセージを格納した配列を返す
	function checker(/* (１つ以上の)検証関数 */) {
		var validators = _.toArray(arguments);
		return function(obj) {
			return _.reduce(validators, function(errs, check){
				if(check(obj))
					return errs
				else
					return _.chain(errs).push(check.message).value(); // _.chain(o) : メソッドをつなぐことができる
			},[]);
		};
	}

	// _.chain関数を使って次のようなひどいパターンを回避
	//
	// {
	//	errs.push(check.message);
	//	return errs;
	// }

	// checker関数が常にプレディケート関数のmessageフィールドを探すことに注目

	// エラーメッセージが擬似メタデータとして付与された特殊用途の検証関数の使用
	// 一般的な解決方法ではないが、コードがきちんと統制されている状況下では有用
	var alwaysPasses = checker(always(true), always(true));

	log("alwaysPasses({})",alwaysPasses({})); // => []

	var fails = always(false);
	fails.message = "人生における過ち";
	var alwaysFails = checker(fails);

	log("alwaysFails({})", alwaysFails({})); // => ["人生における過ち"]

	// messegeプロパティを設定することを忘れるかも
	// 他者が作成した検証関数の既存のmessageプロパティを破壊するかも
	//
	// 検証関数を作成するための、ひと目でわかるようなAPIを提供することが有効である
	function validator(message, fun) {
		var f = function(/* args */) {
			return fun.apply(fun, arguments);
		};
		f['message'] = message;
		return f;
	};

	var gonnaFail = checker(validator("ZOMG!", always(false)));

	log("gonnaFail(100)",gonnaFail(100));

	// 検証関数を一箇所で集中的に定義するよりも、分離した形で定義
	// それぞれわかりやすい名称を与えることができる
	function aMap(obj) {
		return _.isObject(obj);
	}

	var checkCommand = checker(validator("マップデータである必要があります", aMap));
	// aMapは_.isObjectでも可。validator関数内で定義したfにmessageプロパティを設定しているので
	// 非破壊的であり_.isObjectを汚さない
	log("checkCommand({})", checkCommand({})); // => []
	log("checkCommand(33)", checkCommand(33)); // => ["マップデータである必要があります"]

	// 設定オブジェクトが特定のキーに紐付いた値を持っているかどうかを検証する必要があるとする
	// この検証を行う関数を表現する一番よい方法は？

	// たとえば必要とされているキーの単純なリストは美しく「流暢」であると言える
	// hasKeys('msg','type')のようなもの

	function hasKeys() {
		var KEYS = _.toArray(arguments);

		var fun = function(obj) {
			return _.every(KEYS, function(k) {
				return _.has(obj, k);
			});
		};
		fun.message = cat(["これらのキーが存在する必要があります : "], KEYS).join(" ");
		return fun;
	}

	var checkCommand = checker(validator("マップデータである必要があります",aMap), hasKeys('msg', 'type'));

	var result = checkCommand({msg: "blah", type: "display"});
	log("{msg: 'blah', type: 'display'}", result); // => []
	var result = checkCommand(32); // => ["マップデータである必要があります","これらのキーが存在する必要があります : msg type"]
	log("32", result);
	var result = checkCommand({});
	log("{}", result); // => ["これらのキーが存在する必要があります : msg type"]
	var result = checkCommand({msg: "blah"});
	log("{msg: 'blah'}", result); // => ["これらのキーが存在する必要があります : msg type"] <= ないものだけ表示するには？

	// _.has関数 : オブジェクトにキーが存在しているかを確認する関数
	// _.every(list, [iterator], [context]) : listのすべての値がiteratorの真偽テストでtrueを返した場合にtrueを返す
	//                                       iteratorが渡されない場合は要素の値自体で真偽を判定する。
	// JavaScriptは [false, undefined, null, NaN, 0 -0, ""] の場合にfalseと判定しそれ以外はtrueと判定する

	// このように関数を他の関数から返し、返す前に引数を確保しておくテクニックを「カリー化」と言う

	//******************************************************************************************
	// p120 4.4 まとめ *************************************************************************

	// 第一級関数であると同時に以下の特徴をもつ「高階関数」について説明した
	// ・引数として関数をとる
	// ・関数を戻り値として返す

	// _.max, finder, best, repeatedly, iterateUntilといった関数で、関数を他の関数に渡すことを例示
	// always関数によりクロージャを返す関数を例示
	// fnull関数などで、予期しないnullなどの値にデフォルト値を定義して防衛する関数を示す
	// checker関数のように少ないコードで強力な制約検証システムを構築

});

$(function(){
	// p121 ５章 関数を組み立てる関数

	// なぜプログラムの実行中にわざわざ関数を作る必要があるのか？どのように行うのか？
	// 関数の部品を集めて、より豊かな機能をもった関数を「合成する」方法を探る

	//******************************************************************************************
	// p97 5.1 関数合成の基礎 ******************************************************************

	// メソッドを引数に取り、ターゲットとなるオブジェクトでそのメソッドを実行する関数を返す
	function invoker(NAME, METHOD) {
		return function(target /* 任意の数の引数 */) {
			if(!existy(target)) fail("Must provide a target");
			var targetMethod = target[NAME];
			var args = _.rest(arguments);
			var isValidMethod = (existy(targetMethod) && METHOD === targetMethod);
			var actionFun = function() { return targetMethod.apply(target, args);}
			return doWhen(isValidMethod, actionFun); // doWhen(cond,action) : cond == true で action()結果を返す
		};
	};
	// invokerが返す関数はオブジェクトを１つ目の引数に取り、invoker実行時にそのオブジェクトをターゲットにして
	// メソッド呼び出しを行う関数
	// オブジェクトがそのメソッドを持っていない場合、invoker関数はundefinedを返す。
	// これを利用することによって、複数の呼び出しを合成してポリモーフィックな関数、
	// 与えられた引数によって異なる動作を行う関数を生成できる。

	// ひとつ以上の関数を引数に取り、それらの関数をundefined以外の値が返されるまで順番に呼び出す方法
	function dispatch(/* 任意の数の関数 */) {
		var funs = _.toArray(arguments);
		var size = funs.length;

		return function(target /*, 追加の引数 */) {
			var ret = undefined;
			var args = _.rest(arguments);

			for(var funIndex = 0; funIndex < size ; funIndex++) {
				var fun = funs[funIndex];
				ret = fun.apply(fun, construct(target, args));

				if(existy(ret)) return ret;
			}

			return ret;
		};
	}
	// 具体的なメソッドの動作への委譲を単純化することで
	// ポリモーフィック関数の要件(異なるデータ型を扱うことができる単一のインターフェイス)を満たしている

	// たとえばUnderscoreのソースコードでは、多くの関数で次のようなパターンが繰り返し使われている
	//
	// 1. ターゲットが存在することを確認する
	// 2. JavaScriptネイティブのメソッドの存在を確認し、存在する場合はそのメソッドを使用する
	// 3. ネイティブメソッドが存在しない場合は、動作を実装し、決められたタスクを行う
	//     ・該当する場合、特定の型に依存したタスクを実行
	//     ・該当する場合、特定の引数に依存したタスクを実行
	//     ・該当する場合、引数の数に依存したタスクを実行

	// _.map関数のソース
	// _.map = _.collect = function(obj, iterator, context) {
	// 		var results = [];
	//		if(obj == null) return results;
	//		if(nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
	//		each(obj, function(value, index,list) {
	//			results.push(iterator.call(context, value, index, list));
	//		});
	//		return results;
	// };

	// dispatch関数を使うことでコードをいくらか単純化でき、またより容易に拡張を行うことができる
	// e.g. 配列と文字列のいずれかを渡されると、文字列に変換して返す関数
	var str = dispatch(
		invoker('toString', Array.prototype.toString),
		invoker('toString', String.prototype.toString)
	);

	log("str('a')",str("a")); // => "a"
	log("str(_.range(10))",str(_.range(10))); // => "0,1,2,3,4,5,6,7,8,9"
	log("str('abc')",str('abc')); // => "abc"

	// invoker関数とdispatch関数を同時に使うことによって、if-elseを使って型チェックと妥当性チェックを行う
	// ような関数を使わずにArray.prototype.toStringのような具体的に実装された関数の実行を委譲できる

	// dispacth関数は与えられて配列に格納された関数がなくなるか、もしくは正常な値を返すまで、
	// 関数を順番に実行するという約束を実行する

	function stringReverse(s) {
		if(!_.isString(s)) return undefined;
		return s.split('').reverse().join("");
	}

	log("stringReverse('abc')",stringReverse("abc")); // => "cba"
	log("stringReverse(1)",stringReverse(1)); // => undefined

	// このstringReverse関数とArray#reverseメソッドを合成することにより新たなポリモーフィック関数polyrevを生成できる
	var polyrev = dispatch(invoker('reverse', Array.prototype.reverse),
							stringReverse);

	log("polyrev([1,2,3])",polyrev([1,2,3])); // => [3,2,1]
	log("polyrev('abc')",polyrev("abc")); // => "cba"

	// そして、常に正常な値を返すか、常にエラーを返す関数をデフォルトの動作を定義する「終了関数」として用意
	var sillyReverse = dispatch(polyrev, always(42));

	log("sillyReverse([1,2,3])", sillyReverse([1,2,3])); // => [3,2,1]
	log("sillyReverse('abc')", sillyReverse("abc")); // => "cba"
	log("sillyReverse(1000000)", sillyReverse(1000000)); // => 42   (デフォルト値)

	// dispatch関数によって取り除かれるパターン
	// commandオブジェクトのフィールドを参照し異なる関数を実行
	function parformCommandHardcoded(command) {
		var result;

		switch (command.type) {
			case 'notify':
				result = notify(command.message);
				break;
			case 'join':
				result = changeView(command.target);
				break;
			default:
				alert(command.type)
		}
		return result;
	}
	// dispatch関数を使うことによって、このパターンを上手に取り除くことができる
	function isa(type, action) {
		return function(obj) {
			if(type === obj.type) return action(obj);
		};
	}

	var performCommand = dispatch(
							isa('notify', function(obj) { return notify(obj.message); }),
							isa('join'  , function(obj) { return changeView(obj.target); }),
							function(obj){ alert(obj.type); });
	// いくつかの言語ではこのような自動割り当ての仕組みを「マルチメソッド(multimethods)」として提供しています
	// 関数の動作はプレディケート関数のリスト、もしくは任意の関数のリストの実行結果によって決定される

	// parformCommandHardcoded関数を拡張したい場合、switch文の内部を変更する必要がある
	// parformCommand関数を拡張したい場合、別のdispath関数でラッピングするだけで新たな動作を与えられる
	var performAdminCommand = dispatch(isa('kill', function(obj) { return shutdown(obj.hostname); }),
										performCommand);

	// dispatchの関数リストの前にコマンドを追加して、オーバーライドすることで動作を制限できる
	var performTrialUserCommand = dispatch(
									isa('join', function(obj){ alert("許可されるまで参加できません"); }),
									performCommand
									);

	// 既知の方法で既存のパーツを使うことにより新たな動作を組み立てて、その新たな動作も後にパーツとして使用できます。

	//******************************************************************************************
	// p127 5.2 変異は低レイヤーでの操作 *******************************************************

	// 関数は抽象の最小単位である
	// どんな関数であっても最も重要な部分は
	// ・定義された約束を守ること
	// ・要求を満たすこと

	// 変数の変異は視界と意識の外に置いて置くべきものである

	// 関数型アプローチはソリューションの引き出しのひとつ

	//******************************************************************************************
	// p128 5.3 カリー化 ***********************************************************************

	// カリー化された関数 : 論理的な引数が１つ渡されるたびに新しい関数を返す関数

	function rightAwayInvoker() {
		var args = _.toArray(arguments);
		var method = args.shift();
		var target = args.shift();

		return method.apply(target, args);
	}
	var result = rightAwayInvoker(Array.prototype.reverse, [1,2,3]);
	log("rightAwayInvoker", result); // => [3,2,1]
	// rightAwayInvoker関数はターゲットオブジェクトを待ち受ける関数を返すものではなく
	// ２つ目の引数として渡されたターゲットオブジェクトに対してその場でメソッドを呼び出す
	//
	// 一方invoker関数はカリー化されています。
	// つまり、与えられたターゲット上でのメソッドの実行は、論理的な引数の数（２つ）が使い切られるまで
	// 引き延ばされる
	var result = invoker('reverse', Array.prototype.reverse)([1,2,3]);
	log("rightAwayInvoker", result); // => [3,2,1]

	// 生成時のコンテクストに基づいて特定の動作をするように「設定された」関数(クロージャ)を返すと便利

	// カリー化された関数は、最終結果を出すために論理的に必要とされる数のパラメータをすべて埋め尽くすまで
	// 引数を与えるたびに以前より少しだけ「より設定された」関数をかえし続ける

	//******************************************************************************************
	// p130 5.3.1 右へカリー化するか、左へカリー化するか

	// JavaScriptのように任意の数の引数を渡すことが出来る言語では、右から左へカリー化することで
	// オプションの引数の個数を限定できる

	function leftCurryDiv(n) {
		return function(d) {
			return n/d;
		}
	}

	function rightCurryDiv(d) {
		return function(n) {
			return n/d;
		}
	}

	var divide10By = leftCurryDiv(10);
	log("divide10By(2)",divide10By(2)); // => 5
	// 「10/?」？はカリー化された一番右のパラメータで、次の呼び出し時に値を渡されるのを待っている

	// 論理的な関数 x/y (論理的パラメータの数が2) の x に値が与えられた関数（カリー化された関数）クロージャ
	// 左からカリー化された関数

	var divideBy10 = rightCurryDiv(10);
	log("divideBy10(2)",divideBy10(2)); // => 0.2
	// 「?/10」左側のパラメータを待つ状態になる

	// 可換性がない計算においては順序によって結果が異なる

	// ここでは右の引数からカリー化を始める

	//******************************************************************************************
	// p130 5.3.2 自動的にパラメータをカリー化

	// 関数を引数にとり、引数をひとつだけ取るように固定された関数を返す
	function curry(fun) {
		return function(arg) {
			return fun(arg);
		};
	}
	// JavaScriptにおいては期待されているいくつかの引数とともに、いくつかの「専門化を行う」引数を取ることがよくある
	// e.g. parseInt()
	log("parseInt('11')",parseInt('11')); // => 11
	log("parseInt('11',2)",parseInt('11',2)); // => 3 // ２つめの引数は底

	// このparseIntを第一級関数として扱うと、この２つ目のオプション引数が原因となって混乱を招く
	var result = ['11','11','11','11','11','11'].map(parseInt);
	log("parseIntを第一級関数として扱った場合",result); // => [11, NaN, 3, 4, 5, 6]
	// JavaScriptのバージョンにもよるが
	// _.mapは関数を実行する際に「要素, インデックス, 元の配列」と言う３つの引数が与えられる

	// parseIntが引数をひとつだけとるように強制する
	var result = ['11','11','11','11','11','11'].map(curry(parseInt));
	log("parseIntの引数を１つに固定",result); // => [11, 11, 11, 11, 11, 11]

	// 右の方にある専門化のためのオプション引数をcurryのような関数で固定化(無視)することで、関数の動作を確実にコントロールできる
	// 関数のためのインターフェイス？
	//
	// ２つのパラメータをカリー化するcurry2関数
	function curry2(fun) {
		return function(secondArg) {
			return function(firstArg) {
				return fun(firstArg, secondArg);
			}
		};
	}
	// curry2関数は関数を引数にとり。２段階までカリー化を行う
	function div(n, d) {return n / d }
	var div10 = curry2(div)(10);
	log("div10(50)", div10(50)); // => 5

	// curry2関数を使うとparseInt関数の底を常に２に固定することができる
	var parseBinaryString = curry2(parseInt)(2);
	log("parseBinaryString('11')", parseBinaryString('11'));   // => 3
	log("parseBinaryString('115')", parseBinaryString('115')); // => 3
	log("parseBinaryString('13')", parseBinaryString('13'));   // => 1
	log("parseBinaryString('4443')", parseBinaryString('4443')); // => NaN
	log("parseBinaryString('a')", parseBinaryString('a')); // => NaN

	// カリー化はJavaScriptの関数の動作を「専門化」させるための有効なテクニック

	//*******************************************
	// p134 5.3.2.1 カリー化を利用して新しい関数を生成する

	// クロージャがそこに確保した変数で関数の動作をカスタマイズするのと同じように、
	// カリー化で関数のパラメータを満たすことによって同じことができる

	// _.countBy あるデータでタグ付けされた項目をカウントして、その結果を格納したオブジェクトを返す
	var plays = [
				{artist: "Burial",    track: "Archangel"},
				{artist: "Ben Frost", track: "Stomp"},
				{artist: "Ben Frost", track: "Stomp"},
				{artist: "Burial",    track: "Archangel"},
				{artist: "Emeralds",  track: "Snores"},
				{artist: "Burial",    track: "Archangel"},
				];
	var result = _.countBy(plays, function(song){
						return [song.artist, song.track].join(" - ");
					});
	log("_.countBy", result);// => { "Burial - Archangel": 3, "Ben Frost - Stomp": 2, "Emeralds - Snores": 1}
	log("_.countBy value", _.toArray(result));// => [ 3, 2, 1]

	// curry2関数と組み合わせることによって特定のデータをカウントする関数を実装できる
	function songToString(song) {
		return [song.artist, song.track].join(" - ");
	}

	var songCount = curry2(_.countBy)(songToString);
	log("songCount(plays)", songCount(plays));// => { "Burial - Archangel": 3, "Ben Frost - Stomp": 2, "Emeralds - Snores": 1}
	log("songCount(plays) value", _.toArray(songCount(plays)));// => [ 3, 2, 1]

	// カリー化を行うとまるで文章のような表現を行う関数(virtual sentense)を形作ります
	// この場合は
	//
	// To implementing songCount, countBy songToString.
	// 曲数を数えるという関数を、曲名を文字列化して数えるように実装する
	//
	// カリー化によって「流暢」な関数インターフェイスを組み立てることが出来る

	//*******************************************
	// p134 5.3.2.2 ３段階のカリー化でHTMLカラーコードビルダーを実装

	function curry3(fun) {
		return function(last) {
			return function(middle) {
				return function(first) {
					return fun(first, middle, last);
				};
			};
		};
	}

	// _.uniq(array, [isSorted], [iterator]) : 配列arrayから重複要素を取り除いた新しい配列を返す
	//                                         要素の判定は同値演算子(===)で行われる。
	//                                          配列がすでにソートされていることが判明している場合[isSorted]にtrueをセット
	//                                         することで動作が速いアルゴリズムを使用できる
	//                                          iteratorに関数をわたしておくと、これを使って_.mapで前処理を行ってから重複を除く
	//                                         isSortedの位置に関数がくるとiteratorと認識する

	var songsPlayed = curry3(_.uniq)(false)(songToString);
	log("songsPlayed(plays)",songsPlayed(plays)); // => [{artist: "Burial",    track: "Archangel"},{artist: "Ben Frost", track: "Stomp"},{artist: "Emeralds",  track: "Snores"}]

	//         _.uniq(plays, false, songToString);
	// _.curry(_.uniq)      (false)(songToString);

	// 特定の色調を持った色のHTMLカラーコードを生成する関数
	function toHex(n) {
		var hex = n.toString(16);
		return (hex.length < 2) ? [0,hex].join('') : hex;
	}

	function rgbToHexString(r, g, b) {
		return ["#", toHex(r), toHex(g), toHex(b)].join('');
	}

	log("rgbToHexString(255, 255, 255)", rgbToHexString(255, 255, 255)); // "#ffffff"

	// この関数は何段階かのカリー化によって特定の色相をもった色を生成する関数となる
	var blueGreenish = curry3(rgbToHexString)(255)(200);
	log("blueGreenish(0)",blueGreenish(0)); // "#00c8ff"

	//******************************************************************************************
	// p138 5.3.3 「流暢な」APIのためのカリー化

	// Haskellプログラミング言語では、関数はデフォルトでカリー化されている

	// JavaScriptで同様のことを行うためには、カリー化の利点を活用するようにAPIを設計し
	// そして利用方法のドキュメントの提供を行うことが必要

	// カリー化がその場その場で適切なツールかどうかを判断するための一般的なルール
	// 「APIが高階関数を活用するかどうか」

	// カリー化された関数を使って組み立てたchecker関数はとてもシンプルで流暢
	var greaterThan = curry2(function(lhs, rhs) { return lhs > rhs});
	var lessThan = curry2(function(lhs, rhs) { return lhs < rhs});

	var withinRange = checker(
		validator("10より大きい必要があります", greaterThan(10)),
		validator("20より小さい必要があります", lessThan(20)));

	log("withinRange(15)", withinRange(15)); // => []
	log("withinRange(2)", withinRange(2));   // => ["10より大きい必要があります"]
	log("withinRange(50)", withinRange(50)); // => ["20より小さい必要があります"]

	// コードが実際の動作の描写により近くなればなるほど良いものになる

	//******************************************************************************************
	// p139 5.3.4 JavaScriptにおけるカリー化のデメリット

	// JavaScriptにおいてはcurryAllのような任意の段階までカリー化できる関数はあまり実用的ではない
	// カリー化よりも、任意の深さまでの部分適用がより一般的に使われている

	//******************************************************************************************
	// p139 5.4 部分適用 ***********************************************************************

	// カリー化された関数 : 引数が渡されるたびにパラメータがなくなるまで徐々に動作を特化された関数を返す

	// 部分適用(partial application)された関数 : 「部分的に」実行されており、期待している残りの引数を与えることで
	//                                            即時実行する用意をしている関数

	function divPart(n) {
		return function(d) {
			return n/d;
		};
	}

	var over10Part = divPart(10);
	log("over10Part(2)",over10Part(2)); // => 5

	//******************************************************************************************
	// p141 5.4.1 １つ・２つ既知の引数を部分適用

	// １つの引数を部分適用する関数
	function partial1(fun, arg1) {
		return function(/* １つ以上の引数 */) {
			var args = construct(arg1 , arguments);
			return fun.apply(fun, args);
		};
	}

	var over10Part1 = partial1(div, 10);
	log("over10Part1(5)", over10Part1(5)); // => 2

	// 関数ともう一つの関数と「設定用」引数を合成することによってover10関数を再作成

	// 2つの引数を部分適用する関数
	function partial2(fun, arg1, arg2) {
		return function(/* args */) {
			var args = cat([arg1, arg2], arguments);
			return fun.apply(fun, args);
		};
	}

	var div10By2 = partial2(div, 10, 2);
	log("div10By2()", div10By2()); // => 5

	//******************************************************************************************
	// p143 5.4.2 任意の数の引数を部分適用

	// 関数が可変長の引数をとることにより複雑化されてしまうカリー化と異なり
	// 任意の数の引数の部分適用は関数合成の戦略として合理的
	function partial(fun /*, 任意の数の引数 */) {
		var pargs = _.rest(arguments);

		return function(/* 引数 */) {
			var args = cat(pargs, _.toArray(arguments));
			return fun.apply(fun, args);
		};
	}

	var over10Partial = partial(div, 10);
	log("over10Partial(2)", over10Partial(2)); // => 5

	// JavaScriptネイティブのbind関数が使用できる場合
	// fun.bind.apply(fun, construct(undefined, args)) と書ける

	// 任意の引数を取ることで、部分適用が使用される状況を複雑にする場合
	var div10By2By4by50000Partial = partial(div, 10, 2, 4, 5000);
	log("div10By2By4by50000Partial()", div10By2By4by50000Partial()); // => 5
	// 先頭の 10, 5 のみ受け取っている

	//******************************************************************************************
	// p144 5.4.3 部分適用の実用例 : 事前条件

	var result = validator("引数はマップデータである必要があります", aMap)(42);
	log("42 is a Map?", result); // => false

	var zero = validator("0ではいけません", function(n) { return 0 === n;});
	var number = validator("引数は数値である必要があります", _.isNumber);

	function sqr(n) {
		if(!number(n)) { // throw new Error(number.message);
		}
		if(zero(0)) { // throw new Error(zero.message);
		}
		return n * n;
	}

	log("sqr(10)", sqr(10)); // => 100
	log("sqr(0)", sqr(0));   // Error : 0ではいけません
	log("sqr('a')", sqr("a")); // Error : 引数は数値である必要があります

	// 部分適用を使用することでさらによくなる可能性がある

	// この例のような「基本的な入力データ検証の失敗」のようなエラーもあるが
	// その範疇に入らない、計算結果の保証に関係するエラーも存在する

	// 事前条件(preconditions)  : 関数の呼び出し元の保証
	// 事後条件(postconditions) : 事前条件が満たされたと想定した場合の、関数呼び出しの結果に対する保証

	// 「数値であること」と「ゼロではないこと」という２つの事前条件は
	// 計算自体の骨子に関係しているものではなく、あくまで実行部の動作保証を行うためのもの

	// 事前条件と計算の骨子を分離
	function condition1(/* １つ以上の検証関数 */) {
		var validators = _.toArray(arguments);

		return function(fun, arg) {
			var errors = mapcat(
				function(isValid) {
					return isValid(arg) ? [] : [isValid.message];
				}, validators);
			if(!_.isEmpty(errors)) {
				throw new Error(errors.join(", "));
			}
			return fun(arg);
		};
	}

	var sqrPre = condition1(
		validator("0ではいけません", complement(zero)),
		validator("引数は数値である必要があります", _.isNumber));

	log("sqrPre(_.identity, 10)",sqrPre(_.identity, 10)); // => 10
	// log("sqrPre(_.identity, 0)",sqrPre(_.identity, 0));  // Error : 0ではいけません
	// log("sqrPre(_.identity, 'a')",sqrPre(_.identity, 'a')); // Error : 引数は数値である必要があります

	function uncheckedSqr(n) {
		return n * n;
	}
	log("uncheckedSqr('')", uncheckedSqr('')); // => 0

	// 演算時に空の文字列を0に自動変換してしまう

	// このような問題を解決するために
	// validator, partial1, condition1, sqrPreといったツールセットをここまで開発してきた

	var checkedSqr = partial1(sqrPre, uncheckedSqr);

	// sqrPre(fun, arg){arg検証 -> fun(arg) : erro}
	// checkedSqr(arg) {sqrPre(uncheckedSqr, arg)}

	// checkedSqrという新しい関数は、関数を生成する関数と、それらの相互作用による新しい関数の構築によって完成した
	log("checkedSqr(10)", checkedSqr(10)); // =>100
	// log("checkedSqr(0)", checkedSqr(0)); // => Error : 0ではいけません
	// log("checkedSqr('a')", checkedSqr('a')); // => Error : 引数は数値である必要があります

	// 検証ステップのオンオフ
	// 検証条件の追加・削除が容易

	var sillySquare = partial1(
		condition1(validator("偶数を入力してください",isEven)),
		checkedSqr);
	// condition1 => function(checkedSqr, arg) => argをisEvenで検証 => checkedSqr(arg)
	log("sillySquare(10)", sillySquare(10)); // => 100
	// log("sillySquare(11)", sillySquare(11)); // => Error : 偶数を入力してください
	// log("sillySquare('')", sillySquare('')); // => Error : 引数は偶数である必要があります
	//log("sillySquare(0)", sillySquare(0)); // => Error : 0ではいけません

	// 他の複数の関数を合成する関数は、それら自身も合成されることが可能であるべき

	// コマンドオブジェクト生成ロジック(checkCommand)を検証関数を使って再実装

	var validateCommand = condition1(
		validator("マップデータである必要があります", _.isObject),
		validator("設定オブジェクトは正しいキーを持っている必要があります", hasKeys('msg','type')));

	var createCommand = partial(validateCommand, _.identity);

	// JavaScriptのコードに安全性をもたらすのは、規律の徹底と、慎重な考え方
	// log("createCommand({})", createCommand({})); // => 設定オブジェクトは正しいキーを持っている必要があります
	// log("createCommand(2)", createCommand(2)); // => マップデータである必要があります、設定オブジェクトは正しいキーを持っている必要があります
	// log("createCommand({msg:'message'})", createCommand({msg:'message'})); // => 設定オブジェクトは正しいキーを持っている必要があります
	log("createCommand({msg:'message', type:'type'})", createCommand({msg:'message', type:'type'}));  // => {msg:'message', type:'type'}

	// 関数合成を使うことによって、後に実行ロジックや検証プロセスをカスタマイズするために、追加の合成を行うことが出来る
	var createLaunchCommand = partial1(
		condition1(validator("設定オブジェクトはcountDownプロパティが必要です", hasKeys('countDown'))),
		createCommand);
	// log("createLaunchCommand({msg:'message', type:'type'})", createLaunchCommand({msg:'message', type:'type'}));
	// => 設定オブジェクトはcountDownプロパティが必要です

	// 関数の生成にカリー化もしくは部分適用を使う場合
	// 「１つ以上の数の引数を専門化することによって合成する」

	// 引数と戻り値の関係にもとづいて関数を合成したいような場合

	//******************************************************************************************
	// p150 5.5 並べた関数を端から端までcompose関数でつなぎ合わせる ****************************

	// 理想化された（本番環境ではあまり見ることのないような）関数型プログラムは、関数でできたパイプラインのようなもの
	// その一端からデータを入力すると、まったく新しいデータとなって逆の端から放出するもの

	// !_.isString(name)
	//
	// このパイプラインは_.isString関数と!演算子で構成されている
	// ・_.isString関数はオブジェクトを受け取り、真偽値を返す
	// ・!演算子は(原則として)真偽値を受け取り、真偽値を返す

	// 関数合成はこのようなタイプのデータチェーンを活用して、
	// 複数の関数とそれらの関数が行うデータ変換によって新しい関数を組み立てる

	function isntString(str) {
		return !_.isString(str);
	}

	// これと全く同じ関数を_.composeを使った関数合成で組み立てることができる
	var isntString = _.compose(function(x){ return !x }, _.isString);
	log("isntString({})", isntString({})); // => true
	// _.compose関数は、合成された関数は右から左に実行される

	function not(x) { return !x; }

	var isntString = _.compose(not, _.isString);

	// 以前に定義したmapcat関数を_.composeを使って実装できる
	var composeMapcat = _.compose(splat(cat), _.map);
	var result = composeMapcat([[1,2],[3,4],[5]], _.identitiy);
	log("composeMapcat", result); // => [1,2,3,4,5]

	//******************************************************************************************
	// p152 5.5.1 合成を使った事前条件と事後条件

	// 事前条件は、ある制約（事後条件）に準拠する戻り値を生成するために関数が必要とする条件を定義している

	// 全節の二乗計算に事後条件を設定する
	var sqrPost = condition1(
		validator("結果は数値である必要があります", _.isNumber),
		validator("結果はゼロではない必要があります", complement(zero)),
		validator("結果は正の数である必要があります", greaterThan(0)));

	var megaCheckedSqr = _.compose(partial(sqrPost, _.identity), checkedSqr);

	// log("megaCheckedSqr(NaN)", megaCheckedSqr(NaN)); // => Error : 結果は正の数である必要があります

	// 関数が事後条件の検証時にエラーを発生させるということは、
	// 前提条件に漏れがあるか、前提条件が厳しすぎるか、もしくは内部ロジックに不具合がある

	//******************************************************************************************
	// p153 5.5 まとめ *************************************************************************

	// 合成の最初のフェーズは、手動で関数を次々に呼び出し、そしてそれらの呼び出しを別の関数で包んだもの

	// 合成関数の使用

	// curry : 関数といくつかの他の引数を取り一番右の引数を固定する
	// partial : 関数といくつかの値を引数に取りその値を関数の左側の引数として与えた状態の関数を返す

	// _.compose : いくつかの関数を引数に取り、与えられた右の関数から左の関数まで、ひとつひとつを順に結ぶ


});

$(function(){
	// p155 ６章 再帰

	// 関数を終了すべき時はいつなのか
	// その時になぜそうすることが良いことなのか

	//******************************************************************************************
	// p155 6.1 自身を呼ぶ関数 *****************************************************************

	// 再帰(recursion)が関数型プログラミングにとって重要である理由
	// ・再帰関数を使ったソリューションは、共通の問題のサブセットに単一の抽象を使用する
	// ・再帰は可変の状態を隠蔽することができる
	// ・再帰は遅延評価や、無限データ構造の処理を行う手段のひとつである

	// e.g. 配列を引数としてとり、その長さ(要素の数)を返すmyLengthという関数を構築する

	// myLengthの特性

	// 1. サイズ０から開始
	// 2. 配列をループ走査し、それぞれの要素を走査するたびに１を加算
	// 3. 最後まで走査したら、そのサイズが長さである

	// 再帰の考えを伴ったmyLengthの特性

	// 1. もし配列が空であれば、長さは０
	// 2. 配列の最初の要素を切り取り、残りをmyLengthに渡した実行結果に１を加える

	function myLength(ary) {
		if(_.isEmpty(ary))
			return 0;
		else
			return 1 + myLength(_.rest(ary));
	}

	log("myLength(_.range(10))", myLength(_.range(10))); // => 10
	log("myLength([])", myLength([])); // => 0

	// 再帰を使ったソリューションを上手く実装するには
	// 「値は、大きな問題に内包された小さな問題によって組み立てられるものである」
	// myLengthの場合は空の配列の長さ(0)に単一要素を持った配列の長さ(1)を
	// いくつか加えたものとしてみることができる

	// 再帰関数は与えられた引数そのものを編集するべきではありません
	// 論理的に消費するかもしれないが、決して実際に消費すべきではない
	var a = _.range(10);
	log("a length", myLength(a)); // => 10
	log("a",a); // => [0,1,2,3,4,5,6,7,8,9]

	// 再帰は配列やオブジェクトを含む任意の型の組み立てることができる
	// e.g. 数値と配列を引数として受け取り、数値で指定された回数だけ配列を繰り返し結合し
	//      新しい配列を返す関数を考える
	function cycle(times, ary) {
		if(times <= 0)
			return [];
		else
			return cat(ary, cycle(times - 1, ary));
	}

	log("cycle(2,[1,2,3])", cycle(2,[1,2,3])); // => [1,2,3,1,2,3]
	log("_.take(cycle(20,[1,2,3]), 11)", _.take(cycle(20,[1,2,3]), 11)); // => [1,2,3,1,2,3,1,2,3,1,2,3,1,2]

	// _.take(array, [n]) : _.firstのエイリアス。配列arrayの最初の要素を返す。数値 n を指定するとさいしょのn個の要素を返す

	// _.zip(array1, array2) : 二つの配列を引数に取り、１つ目の配列の要素と２つ目の配列の同じインデックス番号の要素をペアにする
	var result = _.zip(['a','b','c'],[1, 2, 3, 4]);
	log("zip", result); // => [['a', 1],['b', 2],['c', 3], ['', 4]]
	// unzip関数を実装する
	// unzipされる配列がどのような「ペア状態か考える必要がある」
	var zipped1 = [['a', 1]];
	// 基本的なzippedケース
	// zipped1 -> [['a'],[1]]に変換するには・・・

	// zipped1配列の最初の要素を終了条件の１つ目の配列の要素として
	// ２つ目の要素を終了条件の２番目の配列の要素にする
	function constructPair(pair, rests) {
		return [construct(_.first(pair), _.first(rests)),
				construct(second(pair), second(rests))];
	}
	// zipped1 と終了条件の配列を使うことによって手動でunzipできる
	log("constructPair(['a', 1],[[],[]])", constructPair(['a', 1], [[],[]])); // => [['a'], [1]]
	var result = _.zip.apply(null,constructPair(['a',1],[[],[]]));
	log("zip", result); // => [['a', 1]]

	// もっと大きなzip化配列をunzip
	var result = constructPair(['a',1],constructPair(['b', 2], constructPair(['c', 3], [[],[]])));
	log("多段unzip", result); // => [['a','b','c'], [1, 2, 3]]

	// これを元に再帰関数を実装
	function unzip(pairs) {
		if(_.isEmpty(pairs)) return [[],[]];
		return constructPair(_.first(pairs), unzip(_.rest(pairs)));
	}

	var result = unzip(_.zip([1,2,3],[4,5,6]));
	log("unzip(zip)", result); // [[1,2,3],[4,5,6]]

	// 自己再帰関数を記述する際に考慮すべき条件
	// ・終了条件を知る
	// ・どのように１ステップを行うかを決める
	// ・問題を、その１ステップもしくはより小さい問題に分解する

	// myLength関数
	// 終了条件 : _.isEmpty
	// １ステップ : 1 + ...
	// より小さな問題 : _.rest

	// cycle関数
	// 終了条件 : times < =
	// １ステップ : cat(array...
	// より小さな問題 : times - 1

	// unzip関数
	// 終了条件 : _.isEmpty
	// １ステップ : constructPair(_.first....
	// より小さな問題 : _.rest

	//******************************************************************************************
	// p161 6.1.1 再帰を使ったグラフ探索

	// グラフ型データ構造のノード探索

	//
	//                   ---------------- Self ----------
	//                   |                 |            |
	//    ----------> Smaltalk             |            |
	//    |                                V            |
	//   Lisp          ---------------> JavaScript      |
	//    |            |                                |
	//    ----------> Scheme                            |
	//                 |                                |
	//                 ----------------> Lua <-----------
	//
	// graf) プログラミング言語の影響の関係を表した不完全なグラフ

	// 影響を及ぼした言語と影響を与えられた言語の関係のコード化
	var influences = [
		['Lisp',    'Smalltalk'],
		['Lisp',    'Scheme'],
		['Smalltalk', 'Self'],
		['Scheme',  'JavaScript'],
		['Scheme',  'Lua'],
		['Self',    'Lua'],
		['Self',    'JavaScript']];

	// 文字列nodeとして渡された言語に影響を及ぼされたプログラミング言語をグラフから
	// 再帰的に探索してそれらの言語を格納した配列を返す
	function nexts(graph, node) {
		if(_.isEmpty(graph)) return []; // 終了条件
		var pair = _.first(graph);
		var from = _.first(pair);
		var to = second(pair);
		var more = _.rest(graph);

		if(_.isEqual(node, from))
			return construct(to, nexts(more, node));
		else
			return nexts(more, node);
	}

	var result = nexts(influences, 'Lisp');
	log("nexts", result); // =>["Smaltark", "Scheme"]

	// nexs
	// 終了条件 : _.isEmpty
	// １ステップ : construct(...
	// より小さな問題 : _.rest
	// if文の分岐先それぞれに再帰呼び出しが記述されている

	//******************************************************************************************
	// p163 6.1.2 記録つき深さ優先自己再帰探索

	// 深さ優先探索(depth-first search)
	//
	//                   ---------------- 3.Self --------
	//                   |                 |            |
	//    ----------> 2.Smaltalk           |            |
	//    |                                V            |
	// 1. Lisp          ---------------> 5.JavaScript   |
	//    |            |                                |
	//    ----------> 6.Scheme                          |
	//                 |                                |
	//                 ----------------> 4.Lua <---------
	//
	// graf) influencesグラフを深さ優先で探索

	// グラフによっては循環している可能性もあるため、探索済みのノードの記録を保持
	// 自己再帰の呼び出しは引数を通じてのみ次の関数呼び出しに影響を及ぼすことができる
	// そのため、記録は累積変数(accumulator)を介して渡される必要がある
	// 累積変数は再帰関数が異なる呼び出しの間で情報をやり取りする場合の一般的な方法

	function depthSearch(graph, nodes, seen) {
		if(_.isEmpty(nodes)) return rev(seen);

		var node = _.first(nodes);
		var more = _.rest(nodes);

		if(_.contains(seen, node))
			return depthSearch(graph, more, seen);
		else
			return depthSearch(graph,
								cat(nexts(graph, node), more),
								construct(node, seen));
	}

	var result = depthSearch(influences, ['Lisp'], []);
	log("Lisp", result);  // => ["Lisp", "Smalltalk", "Self", "Lua", "Scheme", "JavaScript"]

	var result = depthSearch(influences, ['Smalltalk', 'Self'], []);
	log("Smalltalk, Self", result);  // => ["Smaltalk", "Self", "Lua", "JavaScript"]

	var result = depthSearch(construct(['Lua','Io'],influences), ['Lisp'], []);
	log("Lisp", result);  // => ["Lisp", "Smaltalk", "Self", "Lua", "Io",  "JavaScript", "Scheme"]

	// depthSearch関数自体は深さ優先探索の順序においてなにかを行うためのノードの配列を組み立てているだけ

	// p165 6.1.2.1 末尾再帰(自己末尾再帰)

	// depthSearch
	// 終了条件 : _.isEmpty
	// １ステップ : depothSearch(mora...
	// より小さな問題 : depthSearch(cat...
	//
	// nexts関数と違いdepthSearch関数は「１ステップ」および「より小さな問題」が再帰呼び出しである
	// これらの一方、または両方が再帰呼び出しである関数を
	// 末尾再帰(tail recursion)
	// 関数内で起こる(終了条件を満たす場合を除いた)最後のアクションが再帰呼び出しであること

	// depthSearchでは最後の呼び出しが再帰呼び出しなので、その関数実行部が再帰終了後に実行されることはない

	// 末尾再帰を使ってmyLengthを再実装
	function tcLength(ary, n) {
		var l = n ? n : 0;

		if(_.isEmpty(ary))
			return l;
		else
			return tclength(_.rest(ary), l + 1);
	}

	// [  [  [  [  [  [ ]]]]]]
	// -> 潜る時に accumulator + 1 、最下層到達でaccumulatorを順次上の階層にリターン

	// 比較 末尾再帰を使わない
	function myLength(ary) {
		if(_.isEmpty(ary))
			return 0;
		else
			return 1 + myLength(_.rest(ary));
	}
	// [  [  [  [  [  [ ]]]]]]
	// -> 潜る時には何もしない、最下層到達で下層部からのリターンに１を加えながら(関数の実行部)上層部にリターン

	// myLengthの再帰呼び出しは、最後の加算を行った後に関数実行部の続きの処理(1 + ... )を行います。

	// Schemeのような言語はこのような(最下層到達で後は結果を上に戻すだけ)状況を判断して、末尾再帰の関数実行部で使われている
	// リソース割り当てを解除できる。
	// JavaScriptには最適化エンジンが存在しないので深い再帰呼び出しのたびにコールスタックに大打撃

	//******************************************************************************************
	// p166 6.1.3 再帰と関数合成 : 論理積と論理和

	// 関数合成のための関数の創造プロセス

	// 必要とされる合成ツールはすでにUnderscoreが実装していたり、本書ですでに実装されている

	// orify, andify と言う再帰を使ったコンビネータの実装を行ってみる
	function andify(/* 任意のプレディケート関数 */) {
		var preds = _.toArray(arguments);

		return function(/* 任意の数の引数 */) {
			var args = _.toArray(arguments);

			var everything = function(ps, truth) {
				if(_.isEmpty(ps))
					return truth;
				else
					return _.every(args, _.first(ps)) && everything(_.rest(ps), truth);
			};
			return everything(preds, true);
		};
	}

	// Q. _.everyを使ってandify関数を短絡化したバージョンを実装できる
	// _.every(args, function(arg){ ...すべての検証関数を試す })

	// 論理演算し(&&)は「遅延評価(lazy evaluation)」を行うため、_.everyの呼び出しがfalse値を返す場合には再帰呼び出しが起こらない
	// このタイプの遅延評価は「短絡評価(short circuiting)」と呼ばれ、必要のない計算を回避するために使用される方法

	// andifyに渡されたプレディケート関数を、ローカル関数everythingで「消費」している
	// 再帰呼び出しで累積変数を隠蔽するためによく使われる

	var evenNums = andify(_.isNumber, isEven);

	log("evenNums(1, 2)", evenNums(1, 2));             // => false
	log("evenNums(2, 4, 6, 8)", evenNums(2, 4, 6, 8)); // => true
	log("evenNums(2, 'a')", evenNums(2, "a"));         // => false

	// orify関数は逆のロジックを使う部分がある以外は、andify関数の実装とほぼ同じ
	function orify(/* 任意のプレディケート関数 */) {
		var preds = _.toArray(arguments);

		return function(/* 任意の数の引数 */) {
			var args = _.toArray(arguments);

			var everything = function(ps, truth) {
				if(_.isEmpty(ps))
					return truth;
				else
					return _.some(args, _.first(ps)) || everything(_.rest(ps), truth);
			};
			return everything(preds, false);
		};
	}

	var zero = validator("0ではいけません", function(n) { return 0 === n;});
	var zeroOrOdd = orify(isOdd, zero);

	log("zeroOrOdd()", zeroOrOdd());  // => false
	log("zeroOrOdd(0, 2, 4, 6)", zeroOrOdd(0, 2, 4, 6)); // => true
	log("zeroOrOdd(2, 4, 6)", zeroOrOdd(2, 4, 6)); // => false

	// Q. _.some関数を使ってorifyを実装することもできる

	//******************************************************************************************
	// p169 6.1.4 相互再帰関数(自身を呼ぶ他の関数を呼ぶ関数)

	// 相互再帰関数(mutual recursion)
	function evenSteven(n) {
		if(n === 0)
			return true;
		else
			return oddJohn(Math.abs(n) - 1);
	}

	function oddJohn(n) {
		if(n == 0)
			return false;
		else
			return evenSteven(Math.abs(n) -1);
	}

	// どちらかの関数で0に到達するまで絶対値を１づつ減らしていく
	log("evenSteven(4)", evenSteven(4)); // => true
	log("evenSteven(11)", evenSteven(11)); // => false

	log("oddJohn(4)", oddJohn(4)); // => false
	log("oddJohn(11)", oddJohn(11)); // => true

	// 相互排他的な関数
	// e.g. 関数が自身を_.map関数に引数として渡して呼び出すような再帰関数

	// 与えられた配列を平坦にする関数flat
	function flat(array) {
		if(_.isArray(array))
			return cat.apply(cat, _.map(array, flat));
		else
			return [array];
	}
	// _.flatten(array, [shalolw]) : 配列arrayにネストされている配列があれば、ネストを解いて平坦な新しい配列に変換して返す
	// shallowにtrueを渡すと、１レベルだけ平坦にする

	var result = flat([[3,4],[2,5]]);
	log("flat", result); // => [3, 4, 2, 5]

	var result = flat([[1,2],[3,4,[5,6,[[[7]]],8]]]);
	log("flat", result); // => [1, 2, 3, 4, 5, 6, 7, 8]

	//******************************************************************************************
	// p171 6.1.5 再帰を使った深いコピー

	// 深いコピー(deep copy/deep clone)
	// _.cloneは浅いコピー(shallow copy/shallow clone)：オブジェクトの第一階層だけをコピーし、第二階層以降は参照をコピー
	var x = [{a: [1, 2, 3], b: 42}, {c:{d: []}}];
	var y = _.clone(x);

	y; // => [{a: [1, 2, 3], b: 42}, {c:{d: []}}]

	x[1]['c']['d'] = 10000000;

	y; // => [{a: [1, 2, 3], b: 42}, {c:{d: 10000000}}]

	x[0]['a'] = 10;

	log("x[0]['a']", x[0]['a']); // => 10
	log("y[0]['a']", y[0]['a']); // => 10

	x.push({b:100});
	log("x[2]['b']", x[2]['b']); // => 100
	// log("y[2]['b']", y[2]['b']); // => 未定義またはNULL参照のプロパティ'b'は取得できません

	y.push({k:3});
	y.push({j:11});
	//log("x[3]['j']", x[3]['j']); // => 未定義またはNULL参照のプロパティ'b'は取得できません
	log("y[3]['j']", y[3]['j']); // => 11

	// 本番環境で使えるほど堅固ではないがディープコピーを実現する再帰関数
	function deepClone(obj) {
		if(!existy(obj) || !_.isObject(obj))
			return obj;

		var temp = new obj.constructor();
		for(var key in obj)
			if(obj.hasOwnProperty(key)) temp[key] = deepClone(obj[key]);

		return temp;
	}
	// deepClone に数値などプリミティブが渡された場合は、単純にそれを返す
	// オブジェクトが渡された場合には、それを連想構造のように取り扱い（汎用データ構造万歳！）
	// そのすべてのキー値のマッピングを再帰的にコピーする
	// プロトタイプ継承をしているフィールドをコピーしないように
	// obj.hasOwnProperty(key)を使用している
	var x = [{a: [1, 2, 3], b: 42}, {c:{d: []}}];
	var y = deepClone(x);

	log("_.isEqual(x,y)", _.isEqual(x,y)); // => true

	//******************************************************************************************
	// p171 6.1.6 ネストされた配列を探索する

	// ネストされた配列を持った配列の探索
	// doSomethingWithResult( _.map(someArray, someFunction));
	// このようなパターンは十分に一般的だと思われるため、抽象化される資格がある
	function visit(mapFun, resultFun, array) {
		if(_.isArray(array))
			return resultFun(_.map(array, mapFun));
		else
			return resultFun(array);
	}

	// このような関数を実装しておくことは、部分適用を考える上で非常に役に立ちます
	// visit関数を基盤として関数を１つか２つ部分適用することにより、多くの異なる動作を
	// 定義出来るからです
	log("visit(_.identity, _isNumber, 42)", visit(_.identity, _.isNumber, 42)); // => true
	log("visit(_.isNumber, _.identity,[1,2,null,3])", visit(_.isNumber, _.identity,[1,2,null,3]));
	// => [true, true, false, true]
	log("visit(function(n) { return n * 2 }, rev, _.range(10))", visit(function(n) { return n * 2 }, rev, _.range(10)));
	// => [18, 16, 14, 12, 10, 8, 6, 4, 2, 0]

	// flat関数と同じ原則を用いて、visit関数を使った相互再帰バージョンのdepthSearchを実装できる
	// 子要素を展開した「後に」それぞれの要素にmapFunを実行し、その配列に対して深さ優先探索を行う
	function postDepth(fun, ary) {
		return visit(partial1(postDepth, fun), fun, ary); // visit(mapFun, resultFun, array)
	}
	// return visit(postDepth(FUN, x), fun, ary) // return fun(_.map(ary, postDepth(FUN, x)))

	function preDepth(fun, ary) {
		return visit(partial1(preDepth, fun), fun, fun(ary));
	}
	// return visit(preDepth(FUN, x), fun, fun(ary)) // return fun(_.map(fun(ary), preDepth(FUN, x)))

	var result = postDepth(_.identity, influences);
	log("postDepth(_.identity, influences)", postDepth(_.identity, influences));
	// => [["Lisp","Smalltalk"],["Lisp","Scheme"]....]

	// グラフ内の「Lisp」をすべて大文字の「LISP」に置き換えたい場合
	function enLargeLisp(x) {
		if(x === "Lisp")
			return "LISP";
		return x;
	}
	var result = postDepth(enLargeLisp, influences);
	log("enLargeLisp", result);
	// [["LISP","Smalltalk"],["LISP","Scheme"]...]

	// ここで、ある言語が影響を及ぼした言語の配列を生成したい場合
	function influencedWithStrategy(strategy, lang, graph) {
		var results = [];

		strategy(function(x) {
			if(_.isArray(x) && _.first(x) === lang)
				results.push(second(x));

			return x;
		}, graph);

		return results;
	}
	// accumulatorを再帰探索の外に設置

	var result = influencedWithStrategy(postDepth, "Lisp", influences);
	log("influencedWithStrategy(postDepth, 'Lisp', influences)",result);
	// => ["Smalltalk","Scheme"]

	//******************************************************************************************
	// p176 6.2 再帰多すぎ！(トランポリンとジェネレータ) ***************************************

	// 現在のJavaScriptエンジンは再帰呼び出しの最適化は行わない
	// evenSteven(1000000); // => Error : スタック領域が不足しています

	// このようなエラーは「突然切れる」(blowing the stack)
	// 再帰呼び出しが多すぎるため、スタックに大量のアドレスが書き込まれてプログラムが落ちる

	// このようなエラーを取り除く、トランポリン(trampoline)と言う制御構造

	// 深くネストされた再帰呼び出しのかわりに、トランポリンが呼び出しを「平坦化」する

	// まずevenStevenとoddJohnが再帰呼び出しでスタックを破壊しないように手動で修正する方法を模索
	// 相互再帰関数を直接呼ぶ代わりに呼び出しをラッピングする関数を返す方法
	function evenOline(n) {
		if(n === 0)
			return true;
		else
			return partial1(oddOline, Math.abs(n) - 1);
	}

	function oddOline(n) {
		if(n === 0)
			return false;
		else
			return partial1(evenOline, Math.abs(n) -1);
	}

	log("evenOline(0)", evenOline(0)); // => true
	log("oddOline(0)", oddOline(0));   // => false

	// 手動で再帰構造を平坦化してみる
	log("oddOline(3)", oddOline(3)); // => function() { return evenOline(Math.abs(n) - 1)}
	log("oddOline(3)()", oddOline(3)());
	log("oddOline(3)()()", oddOline(3)()());
	log("oddOline(3)()()()", oddOline(3)()()()); // => true

	// このような平坦化の処理をプログラムで行う
	function trampoline(fun /* 任意の数の引数 */) {
		var result = fun.apply(fun, _.rest(arguments))

		while (_.isFunction(result)) {
			result = result();
		}

		return result;
	}
	// trampoline関数は、関数funの戻り値が関数でなくなるまで、その関数をたびたび呼び出し続ける

	log("trampoline(oddOline, 3)", trampoline(oddOline, 3)); // => true

	// log("trampoline(evenOline, 200000)", trampoline(evenOline, 200000)); // => true
	// log("trampoline(oddOline, 300000)", trampoline(oddOline, 300000)); // => false
	// log("trampoline(evenOline, 2000000)", trampoline(evenOline, 2000000)); // => true

	// この仕組みを関数の内部に完全に隠蔽した形で提供できる
	// 入り口だけトランポリンをラップした関数で提供
	function isEvenSafe(n) {
		if(n === 0)
			return true;
		else
			return trampoline(partial1(oddOline, Math.abs(n) - 1));
	}

	function isOddSafe(n) {
		if(n === 0)
			return false;
		else
			return trampoline(partial1(evenOline, Math.abs(n) - 1));
	}

	// log("isOddSafe(20001)",isOddSafe(20001)); // => true
	// log("isEvenSafe(20001)",isEvenSafe(20001)); // => false

	//******************************************************************************************
	// p180 6.2.1 ジェネレータ(generators)

	// トランポリンの性質を利用して「遅い」「怠惰な」無限のデータストリームを構築して処理する方法
	// 関数を交互に呼び出すような例

	// 「遅くない」「怠惰ではない」データストリーム構築
	var result = _.take(cycle(20,[1,2,3]), 11);
	log("_.take(cycle(20,[1,2,3]), 11)", result); // => [1,2,3,1,2,3,1,2,3,1,2]
	// _.takeは１１個の数値しか求めていないにもかかわらず
	// cycleはあらかじめ６０個の要素を生成している

	// 配列は、「最初の要素と、それ以降のすべての要素によって構成される」ものであるという観点
	// 無限の要素を持つ配列も同様に最初(head)と残り(tail)の組み合わせと認識できる
	// {head: aValue, tail: ???} // オブジェクトに当てはめてみる
	// tailの値には何が入るのか… => tailを計算する再帰関数

	// 1. 現在の要素の値を計算する関数
	// 2. 次の要素の「シード」となる値を計算する関数
	// このような方法で組み立てられた構造は（完全とはいえないものの）ジェネレータと呼ばれる形態

	// 任意の時点での要求に対して「続きの値」を返す関数
	function generator(seed, current, step) {
		return {
			head: current(seed),
			tail: function() {
				console.log("forced"); // デモ用出力
				return generator(step(seed), current, step);
			}
		};
	}
	// tailの値は関数であり、呼び出されるまでは「実際の値」ではない

	// このジェネレータを操作するためのユーティリティ関数
	function genHead(gen) { return gen.head; }
	function genTail(gen) { return gen.tail(); }

	// ジェネレータ関数を定義
	var ints = generator(0, _.identity, function(n) {return n+1});

	log("genHead(ints)", genHead(ints)); // => 0
	log("genTail(ints)", genTail(ints));
	// (コンソール) forced
	// => {head; 1, tail: function}

	log("genTail(genTail(ints))", genTail(genTail(ints)));
	// (コンソール) forced
	// (コンソール) forced
	// => {head; 2, tail: function}

	// これらの２つの関数を使うだけでより強力なアクセサ関数genTakeを組み立てることができる
	function genTake(n, gen) {
		var doTake = function(x, g, ret) {
			if(x === 0)
				return ret;
			else
				return partial(doTake, x-1, genTail(g), cat(ret, genHead(g)));
		};
		return trampoline(doTake, n, gen, []);
	}

	log("genTake(10, ints)", genTake(10, ints));
	// (コンソール) foced * 10
	// => [0,1,2,3,4,5,6,7,8,9]

	log("genTake(100, ints)", genTake(100, ints));
	// (コンソール) foced * 100
	// => [0,1,2,3,4,5,6, ...,98,99]

	// generator関数によって生成されたジェネレータの欠陥
	// tailの要素はアクセスされるまで計算されないが、アクセスされるたびに毎回計算される

	// たとえトランポリンを利用してコールスタックの破綻を防ぐことは出来たとしても、
	// その問題をヒープ領域に押し付けたに過ぎない
	// JavaScriptの場合はヒープ領域のサイズはコールスタックよりも数桁多い

	// トランポリンの考え方自体が、実際にJavaScriptを使う際に意識しておくべき一般的な原則だと言える

	//******************************************************************************************
	// p184 6.2.2 トランポリンの原則とコールバック

	// setTimeoutやXMLHttpRequestなどの非同期APIは関数の終了時に呼び出されるコールバック(単なる関数もしくはクロージャ)
	// を持っている。これによって即時処理されるものであっても時間がかかる処理であってもアプリケーションの操作を
	// ブロックすることなく、実質的な並列処理を行うことができる

	// ノンブロッキングAPIの特徴として、関数呼び出し自体はコールバック関数が呼ばれる前に終了し、
	// 値を返す。その後でコールバックが呼ばれる

	// setTimeout(function() { console.log("Hi!")}, 2000);
	// => 何かしらの値をすぐに返す : アドレス
	// ... 2 second later
	// Hi!

	// JavaScriptはイベントループのそれぞれの新しいtick(イベントループ内でタイミングを刻むステップの単位)
	// の度にコールスタックを白紙に戻す。非同期コールバックは常にイベントループの新しいtickで呼ばれるため
	// 再帰関数でさえ白紙の状態のコールスタックで実行される
	function asyncGetAny(interval, urls, onsuccess, onfailure) {
		var n = urls.length;
		var looper = function(i) {
			setTimeout(function() {
				if(i >= n) {
					onfailure("failed");
					return;
				}
				$.get(urls[i], onsuccess)
					.always(function(){ console.log("try:" + urls[i])})
					.fail(function(){
						looper(i + 1);
					});
			}, interval);
		};
		looper(0);
		return "go";
	}
	// jQueryのpromiseを使ったインターフェイスを使ってGETを実行して、alwaysとfailの各ハンドラを生成している

	// この呼び出しは、スタックがきれいに掃除されているイベントループの異なるtickでそれぞれの呼び出しが行われる
	var urls = ['http://dsfgfgs.com','http://www.shift-the-oracle.com/oracle/limits.html', 'http://sgfjgsj.biz','_.html','underScoreTest.js']
	// var result = asyncGetAny(1000,
	//			urls,
	//			function(data) { alert("データが見つかりました")},
	//			function(data) { console.log("すべて失敗しました")});
	//console.log(result);
	// => "go"
	// (コンソール２秒後) try:http//dsfgfgs.com
	// (２秒後)alert:データが見つかりました
	// try:http//dsfgfgs.com

	function repeatText(interval, times) {
		var n  = times;
		var looper = function(i) {
				setTimeout(function(){
				if(i >= n) {
					console.log("end");
					return;
				}
				log("times", i);
				looper(i + 1);
			},interval);
		};
		looper(0);
		return "start!";
	}
	repeatText(1000,3);

	//******************************************************************************************
	// p186 6.3 再帰は低レイヤーでの操作 *******************************************************

	// 再帰は低レイヤーでの操作であり、可能な場合は避けたほうが良い

	// influencedWithStrategy関数の実装は再帰を使う必要がない

	// すでに存在する関数を組み合わせて実装する
	// そのための補助関数を生成
	var groupFrom = curry2(_.groupBy)(_.first);
	var groupTo   = curry2(_.groupBy)( second);

	groupFrom(influences);
	// => {Lisp:[["Lisp", "Smalltalk"], ["Lisp", "Scheme"]],
	//     Smalltalk:[["Smalltalk", "Self"]],
	//     Scheme:[["Scheme", "JavaScript"],["Scheme", "Lua"]],
	//     Self:[["Self", "Lua"],["Self", "JavaScript"]]}

	groupTo(influences);
	// => {Smalltalk:[["Lisp", "Smalltalk"]],
	//     Scheme:[["Lisp", "Scheme"]],
	//     Self:[["Smalltalk", "Self"]],
	//     JavaScript:[["Scheme", "JavaScript"], ["Self", "JavaScript"]],
	//     Lua:[["Scheme", "Lua"], ["Self", "Lua"]]}

	function influenced(graph, node) {
		return _.map(groupFrom(graph)[node], second);
	}

	var result = influenced(influences, 'Lisp');
	log("influenced", result); // => ["Smaltalk", "Scheme"]

	//******************************************************************************************
	// p188 6.4 まとめ *************************************************************************

	// 自身を呼び出す関数はネストされたデータ構造の探索と操作のための強力なツール

	// 探索については深さ優先探索を行うvisit関数を用いて木構造を探索する例を示した
	// 展開された配列子要素に対し展開関数を適用してマッピング

	// JavaScriptでの再帰の回数制限と言う基本的な制限に抵触する可能性がある

	// トランポリンと言うテクニックを使用することでクロージャの配列を通してお互いを呼び合う関数を構築する方法

	// 極力、関数合成を使用し、再帰やトランポリンは必要な場合のみ使用する
});

$(function(){
	// p189 ７章 純粋性、不変性、変更ポリシー

	// 完全に関数型かつ実用的なスタイルを求めるための要点を説明する
	// 関数を使って構築すること、だけではなく
	// 関数型プログラミングは、ソフトウェアの創造プロセスにまとわりつく複雑さを最小限に抑えるための構築方法を考える手段
	// 複雑さを抑える方法のひとつはプログラム内の状態変更を最小限に抑える、
	// もしくは(理想的には)完全に排除すること


	//******************************************************************************************
	// p189 7.1 純粋性 *************************************************************************

	// ある数値を与えられると１からその数値までの間から(擬似)ランダムに選んだ数値を返すような関数を考える
	var rand = partial1(_.random, 1);

	log("rand(10)", rand(10)); // => 8

	var result = repeatedly(10, partial1(rand, 10));
	log("repeat10 rand", result); // => [6,10,1,10,4,4,3,2,2,6]

	var result = _.take(repeatedly(100, partial1(rand, 10)), 5);
	log("take5 repaet10 rand", result); // => [6,3,5,9,4]

	// ランダムな小文字アルファベットと数字で構成された文字列を生成する関数のパーツとしても使える
	function randString(len) {
		var ascii =  repeatedly(len, partial1(rand, 36));
		return _.map(ascii, function(n) {
			return n.toString(36);}).join('');
	}

	log("randString(0)", randString(0)); // => ""
	log("randString(1)", randString(1)); // => "h"
	log("randString(10)", randString(10)); // => "gxhw4iriw2"

	// この関数はこれまでの関数とは大きな違いを一つ持っている
	// その違いが見えるか？

	// この答えはもう一つの質問の答えの一部
	//「あなたはこれをテストできますか？」

	//******************************************************************************************
	// p190 7.1.1 純粋性とテストの関係

	// 純粋性のルール
	// ・結果は引数として与えられた値からのみ計算される
	// ・関数の外部で変更される可能性のあるデータに一切依存しない
	// ・関数実行部の外側に存在する何かの状態を一切変更しない

	// randString関数は計算使用するための引数を取らない
	// _.randomに依存している

	// 呼び出し時に「シード値」の提供を許容することで、ランダム数値の生成を行う純粋関数を書くことができる

	// １つ目のルールを破る他の例
	PI = 3.14;
	function areaOfACircle(radius) {
		return PI * radius * radius;
	}
	log("areaOfACircle(3)", areaOfACircle(3));

	//******************************************************************************************
	// p193 7.2 純粋と不純を分離する ***********************************************************

	// そもそもJavaScriptのMath.randメソッドは純粋関数ではないため、このメソッドを使用するすべての関数は
	// 純粋ではなくなり、多くの場合はテストがより複雑になる

	// 純粋な関数は、入力値とそれに対応する予測出力値のテーブルデータを作成してテストします

	// 完全な純粋性を持つことは出来ないが純粋な部分と不純な部分に分離して、変更の影響を最小化できる

	// 不純な部分
	function generateRandomCharacter() {
		return rand(26).toString(36); // 意図的に誤りを仕込んでいる
	}

	// 純粋な部分
	function generateString(charGen, len) {
		return repeatedly(len, charGen).join('');
	}

	// 関数合成により不純な文字列生成関数を組み立てることができる
	var generateRandomString = partial1(generateString, generateRandomCharacter);
	log("generateRandomString(10)", generateRandomString(10)); // => "ccjog746gd"

	// 純粋な部分だけ単独でテストすることができる

	// 考察 : ランダムな数字を文字列に変換するのではなく
	//        設定したドメインから選ぶためのインデックスを生成する
	//        ドメインの正当性、生成されたインデックスの正当性の検証で済むのでは？


	//******************************************************************************************
	// p195 7.2.1 不純関数を適切にテストする

	// 不純な部分を最小限まで絞り込んで隔離した場合、テストはいくぶんか楽になる
	// 戻り値が特定の値である場合をテストすることは出来ませんが戻り値の一定の特徴についてはテストできる

	// generateRondomCharacterでの戻り値の特徴
	// ・ASCII文字であること
	// ・１桁の数値であること
	// ・文字列型であること
	// ・文字であること
	// ・小文字であること

	// 大量のテストデータが必要になる、反復回数を増やしても完全に満足できない
	// 生成される文字が一定の範囲内の文字列であることを確認することもいい
	// generateRandomCharacterの実装には(意図的な誤りによる)すべての小文字を生成できない
	// と言う制限がある

	//******************************************************************************************
	// p196 7.2.2 純粋性と参照透過性との関係

	// JavaScriptの型付けに対する緩さによる問題が発生することがある
	log("true + 1 === 2", true + 1 === 2); // => true
	// 記述されたコードが及ぼす影響が把握しにくくなり、テストがより難しくなる

	// 純粋関数を使う場合は、関数の合成が簡単に行え、コード内の関数を同等の関数または
	// 予想される値で置き換えることができるようになる
	// e.g.
	function nth(array, index) {
		return array[index];
	}
	// 参照透過性(transparency) : 引数が同じであればいつ実行されても同じ値を返す

	// 与えられた引数を変更しない

	// しかしnth関数は不純なもの、オブジェクトや配列、もしくは不純関数を返す可能性がある

	// この問題を修正するためには純粋関数だけを定義および使用するように気をつけることだけ

	//******************************************************************************************
	// p199 7.2.3 純粋性と冪等性の関係

	// 冪等性(idempotence) : あるアクションを何度行ってもい一度行った場合と全く同じ効果をもたらす

	// 冪等である関数は次の条件を満たす
	// someFun(arg) == _.compose(someFun, someFun)(arg);

	var a = [1, [10, 20, 30], 3];
	var secondTwice = _.compose(second, second);
	log("second(a) === secondTwice(a)", second(a) === secondTwice(a));
	// => false

	var dissociativeIdentity = _.compose(_.identity, _.identity);
	log("_.identity(42) === _.dissociativeIdentity(42)", _.identity(42) === dissociativeIdentity(42));
	// => true

	log("Math.abs(-42) === Math.abs(Mas.abs(-42))", Math.abs(-42) === Math.abs(Math.abs(-42)));
	// => true

	//******************************************************************************************
	// p200 7.3 不変性 *************************************************************************

	// 文字列型は不変性を持った数少ないデータ型

	// JavaScriptにおいて次のような変異は許容されている
	var obj = {lemongrab: "Earl"};

	(function(o){
		_.extend(o, {lemongrab: "King"});
		})(obj);

	log("obj['lemongrab']", obj['lemongrab']); // "King"

	// _.extend(destination, *sorces) sourcesに渡されたオブジェクトのプロパティをdestinationオブジェクト
	// に追加する。その際、destinationオブジェクト自身が変更対象となり、キーが重複する場合は新しい値で
	// 上書きされる。sorcesに渡した順番に上書きするため、最後に渡されたオブジェクトが優先される

	//******************************************************************************************
	// p203 7.3.1 誰もいない森で木が倒れたら、音がするでしょうか？

	// 数値 n と配列を渡すと、配列のインデックスが n の倍数の要素を抜き出して新たな配列に格納し
	// その新たな配列を返します
	function skipTake(n, coll) {
		var ret = [];

		var sz = _.size(coll);
		for(var index = 0; index < sz; index += n){
			ret.push(coll[index]);
		}
		return ret;
	}

	log("skipTake(2, [1,2,3,45,6])", skipTake(2, [1,2,3,45,6])); // => [1, 3, 6]
	log("skipTake(4, _.range(20))", skipTake(4, _.range(20))); // => [0, 4, 8, 12, 16]

	// 配列を変異させるArray#pushの実行を含んだ命令型スタイルのループを意図的に使用
	// 関数型プログラミングのテクニックを使ってskipTakeを実装する方法もある
	// しかし、forループを使った実装は小さく単純で、早く動作する。
	// そして、ここで重要なのは、命令型アプローチを使っている事実が、この関数の使用者に
	// 完全に隠蔽されているということ

	// 関数を抽象の基本的なユニットとしてみる利点は、その実装内容さえ「漏れる」ことがなければ
	// 関数内部の詳細な実装方法はまったく無関係であるということ

	// 誰もいない森で木が倒れたら、音がするでしょうか？
	// 不変性を持った戻り値を生成するために純粋関数がローカルデータを変異させたとしたら
	// それは良いことなのでしょうか？
	// -----Rich Hickey

	//******************************************************************************************
	// p204 7.3.2 不変性と、その再帰との関係

	// 多くの関数型プログラミング言語では、ローカル変数の変異を用いたsummのような関数を書くことができない
	function summ(array) {
		var result = 0;
		var sz = array.length;

		for(var i = 0; i < sz; i ++) result += array[i];

		return result;
	}

	log("summ(_.range(1,11))", summ(_.range(1,11)) ); // => 55

	// 関数summの問題は、 i と result と言う２つのローカル変数を変異させているということ
	// 伝統的な関数型言語におけるローカル変数は実際には全く「変数」ではなく、不変であり、変更することができない。

	// このようなローカル変数を変更するためのただ一つの方法は、コールスタックを介して変更すること
	// つまり、これは再帰が行うことそのものである。サブファンクションの引数で渡すことで関数外からの変更が加わる
	function summRec(array, seed) {
		if(_.isEmpty(array))
			return seed;
		else
			return summRec(_.rest(array), _.first(array) + seed);
	}

	log("summRec([],0)", summRec([],0)); // => 0
	log("summRec(_.range(1,11),0)", summRec(_.range(1,11), 0)); // => 55

	// JavaScriptはこのような再帰を使った状態管理を許容しますが、同時にローカル変数の変異も許容する
	// 早く動くのであればそちらを使った方がよい

	//******************************************************************************************
	// p206 7.3.3 防御的フリーズとクローン

	// 最近のJavaScriptにはオブジェクトもしくは配列が渡された場合に、その後のすべての変更を無効にする
	// Object#freezというメソッドが提供されている

	// Strict mode でJavaScriptを記述している場合は変更が無効にされた時点でTypeError例外をスローし
	// Strict mode ではない場合は失敗したことを知らせることなく失敗します

	var a = [1, 2, 3];
	a[1] = 42;
	log("a a[1] <= 42", a); // => [1, 42, 3]

	Object.freeze(a);

	a[1] = 108;
	log("freezed a a[1] <= 108", a); // => [1, 42, 3] // 変更は反映されていない

	log("Object.isFrozen(a)", Object.isFrozen(a)); // => true

	// Object#freezeを使用した不変性の確保には２つの問題がある
	// ・コードベース全体をコントロールできる立場にいないと。微妙なエラーを発生させる可能性がある
	// ・Object#freezeは「浅く」フリーズさせる

	// Object#freezeはオブジェクトの一番上のレベルのみフリーズさせ、ネストされたオブジェクトはフリーズしない

	var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];
	Object.freeze(x);
	x[0] == "";
	log("shallowFrozen x[0]['a']", x[0]['a']); // => [1, 2, 3]  // 一段目の変更は反映されていない

	x[1]['c']['d'] = 10000;
	log("shallowFrozeen x[1]['c']['d']", x[1]['c']['d']); // 10000 // 二段目以降の変更は反映されている


	// 「深い」フリーズを行う場合は、再帰を使ってデータ構造を探索する必要がある
	function deepFreeze(obj) {
		if(!Object.isFrozen(obj))
			Object.freeze(obj);

		for(var key in obj) {
			if(!obj.hasOwnProperty(key) || !_.isObject(obj[key]))
				continue;

		deepFreeze(obj[key]);
		}
	}

	var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

	deepFreeze(x);
	x[0] = null;
	log("deepFrozen x[0]['a']", x[0]['a']); // => [1, 2, 3]  // 変更は反映されていない

	x[1]['c']['d'] = 10000;
	log("deepFrozeen x[1]['c']['d']", x[1]['c']['d']); // => "" // 二段目以降も変更が反映されていない

	// しかしオブジェクトをフリーズすることは、サードパーティAPIを使用する場合にバグをもたらす可能性がある
	// 外見ではフリーズされているかどうか分からない

	// 不変性を保つために取りうる手段は実質的に以下の３点のいずれか
	// ・浅いコピーで十分である場合は、_.cloneを使ってコピーする
	// ・深いコピーが必要な場合はdeepCloneを使う
	// ・純粋関数を使ってコードを記述する

	// 本書では３つ目のオプションを使う
	// 関数型及びオブジェクト中心APIの純粋性のために、不変性を保つという考え方進めていく

	//******************************************************************************************
	// p209 7.3.4 関数レベルでの不変性を意識する

	// コレクションを引数にとり、コレクションを構築する

	// e.g. 数値または文字列の配列を引数にとり、配列のそれぞれの要素のキーに、
	//      要素が配列に登場した回数をフィールドの値としたオブジェクトを返す関数を考える
	var freq = curry2(_.countBy)(_.identity);

	// _.countBy関数の動作は非破壊的であるため、_.identityと組み合わせると純粋関数を作ることが出来る
	var a = repeatedly(1000, partial1(rand, 2));
	var copy = _.clone(a);
	log("freq(a)", freq(a)); // => {1: 501, 2: 499}
	log("_.isEqual(a, copy)", _.isEqual(a, copy)); // => true

	// 関数内に可変変数を持っているがskipTake関数も純粋であるため、安全に合成できる
	log("freq(skipTake(2, a))",freq(skipTake(2, a))); // => {1: 245, 2: 255}
	log("_.isEqual(a, copy)", _.isEqual(a, copy)); // => true

	// オブジェクトの内容を変更してしまう関数
	var person = {fname: "Simon"};
	var result = _.extend(person, {lname: "Petrikov"}, {age: 28}, {age: 108});
	log("_.extend result", result); // => {fname: "Simon", lname: "Petrikov", age: 108}
	log("modified person", person); // => {fname: "Simon", lname: "Petrikov", age: 108}
	// _.extendは一つ目に与えられた引数を左から右に結合していく

	// _.extendを使ってオブジェクトを結合する新たな関数mergeを変わりに定義する
	function merge(/* 任意の数のオブジェクト */) {
		return _.extend.apply(null, construct({}, arguments));
	}

	var person = {fname: "Simon"};
	var result = merge(person, {lname: "Petrikov"}, {age: 28}, {age: 108});
	log("merge result", result); // => {fname: "Simon", lname: "Petrikov", age: 108}
	log("person", person); // => {fname: "Simon"} // もとのオブジェクトは変更されない

	//******************************************************************************************
	// p211 7.3.5 オブジェクトの不変性を観察する

	// 不変性を浸透させるために敷くべき規律の例
	// e.g. Pointオブジェクトを断片的に実装する

	function Point(x, y) {
		this._x = x;
		this._y = y;
	}

	// Pointオブジェクトのインスタンスは外部からアクセスできるフィールドを持っていない
	// という事実を隠蔽するために、クロージャによるカプセル化の技法に頼ることになる
	var p = new Point(1,2);
	log("p['_x']", p['_x']); // => 1 // 参照できてしまう

	// しかし著者は「プライベートな」フィールドに特別な名前を与えるようなコンストラクタを定義するという
	// シンプルなアプローチを好む(この場合は_を付与)

	// 不変性を保つというポリシーに従いつつ、withXとwithYという２つの「変更」メソッドを実装する

	// ここではconstructorプロパティを除外する、本来であればPoint.prototypeはconstructorプロパティを持つ

	Point.prototype = {
		withX: function(val) {
			return new Point(val, this._y);
		},
		withY: function(val) {
			return new Point(this._x, val);
		}
	};

	// これらの変更オブジェクトは実際には何も変更しない
	// 変わりに新しいPointオブジェクトを返す

	var p = new Point(0, 1);
	var newP = p.withX(1000);
	log("newP x <- 1000", newP); // => {_x: 1000, _y: 1}
	log("p", p); // => {_x: 0, _y: 1} // もとのオブジェクトは変更されていない

	// 不変オブジェクトに対する変更操作は全て新しいオブジェクトを返すべきである
	// 副作用として良いチェーンAPIを使うことができる

	var p = (new Point(0,1)).withX(100).withY(-100);
	log("p", p); // => {_x: 100, _y: -100}

	// ・不変オブジェクトは生成時の値を保持し、決して変更するべきではない
	// ・不変オブジェクトに対する操作はその結果として新しいオブジェクトを返す
	// (大きなデータ構造をまるまるコピーすることを避けるために、インスタンス間である程度の要素を共有するような
	// 不変オブジェクトを生成する方法もある)

	// これらのルールを守ったとしても、問題に突き当たることもある
	// e.g. 生成時に要素の配列をとり、(部分的な)キューに入れるロジックを提供する
	//      Queueというデータ型の実装を考える
	function Queue(elems) {
		this._q = elems;
	}

	Queue.prototype = {
		enqueue: function(thing) {
			return new Queue(cat(this._q, [thing]));
		}
	};
	// Pointと同様にQueueオブジェクトは生成時にシード値をとる
	// インスタンスのシード値に新しい要素を加えるenqueueメソッドを提供する
	// cat関数は不変性を損なわないので、Queueインスタンス間で参照を共有するような問題を排除する
	var seed = [1, 2, 3];
	var q = new Queue(seed);
	log("q", q); // => {_q: [1, 2, 3]}

	var q2 = q.enqueue(108);
	log("q2", q2); // => {_q: [1, 2, 3, 108]}
	log("q", q); // => {_q: [1, 2, 3]} // q2の生成後もqの値はそのままのこる

	// しかしシード値そのものに変更が加わると
	seed.push(10000);
	log("q", q); // => {_q: [1, 2, 3, 1000]}

	// 配列の参照elemsを直接使ってしまったことが問題
	// この問題を解決する新しいコンストラクタSaferQueueを実装する
	var SaferQueue = function(elems) {
		this._q = _.clone(elems);
	}

	SaferQueue.prototype = {
		enqueue: function(thing) {
			return new SaferQueue(cat(this._q, [thing]));
		}
	};
	// この場合「深い」コピーは不必要。なぜなQueueインスタンスの目的は要素の出し入れを行うことで
	// 複雑なデータ構造の操作を行うことではないから
	// 要素オブジェクト自体の不変性はQueueオブジェクトの責任外
	var seed = [1, 2, 3];
	var sq = new SaferQueue(seed);

	var sq2 = sq.enqueue(36);
	log("sq2", sq2); // => {_q: [1, 2, 3, 36]}

	seed.push(1000);
	log("sq", sq); // => {_q: [1, 2, 3]} // インスタンスは変更されない

	// 直接 _q が変更される危険性は残る
	// SaferQueue.prototypeのメソッドも、簡単に他の好きなメソッドに置き換えることができる

	// 安全性の確保の責任はすべて開発者に委ねられる

	//******************************************************************************************
	// p216 7.3.6 オブジェクト操作は往々にして低レイヤー操作

	// new 演算子やオブジェクトメソッドを使用することにより突然現れる問題がある
	var sq = SaferQueue([1, 2, 3]);
	// var sq2 = sq.enqueue(32); // 未定義またはNULL参照のプロパティenqueueは取得できません

	// インスタンス生成時にnewの付与を忘れてしまった
	// 次のようなコンストラクタを提供
	function queue() {
		return new SaferQueue(_.toArray(arguments));
	}

	var q = queue(1,2,3);

	// もう一歩進めてinvoker関数を使ってenqueueを委譲する関数を生成する
	var enqueue = invoker("enqueue", SaferQueue.prototype.enqueue);
	var sq2 = enqueue(q, 42);
	log("sq2", sq2); // => {_q: [1, 2, 3, 42]}

	// メソッドを直接呼び出す代わりに関数として使うことで柔軟性が手に入る
	// ・実際のデータ型をあまり心配する必要がない
	// ・ユースケースに対応した型のデータを返すことが出来る。
	//   e.g. 小さな配列は小さなマップをモデリングする場合には高速に動作するが
	//        マップが大きくなるとオブジェクトの方が適切な場合も発生する
	//        プログラムによってこの切り替えを透過的に行うことが出来る
	// ・データ型やメソッドが変更された場合、それを使用しているすべての場所を変更せず
	//   関数を変更するだけですむ
	// ・事前条件や事後条件を関数に与えることができる
	// ・関数合成が可能

	// このようにメソッドを使用することは、オブジェクト指向プログラミングの否定ではなく
	// 補完関係にある

	// 関数型スタイルでは、どのような型のデータが流れているかということよりも、関数の動作に注目する

	//******************************************************************************************
	// p218 7.4 変更コントロールのポリシー *****************************************************

	// 何らかの状態を変更することが必要な時が絶対にある
	// そのような変更を出来る限り少なくするための方法を考える

	// e.g.
	// プログラムの生存期間中にオブジェクトが生成され、そして変更される場所の依存関係をグラフで表した
	// 小さなプログラムを想像する

	//               moduleA
	//     yを変更
	// [x] -----------------------> [b]
	//  |      |                     ^
	//  |      v                     |
	//  |     [y]---------->[a]-------
	//  |                    |
	//=======================================
	//  |     moduleB  ||    |  moduleC
	//  v              ||    |
	// [z]----->[f]----||-->[x]
	//                 ||
	//                 ||
	// graph) 変更の網が存在するとどのような変更であってもグローバルに影響する可能性を持つ

	//               moduleA
	//
	// [x]
	//
	//
	//
	//
	//=======================================
	//        moduleB  ||       moduleC
	//                 ||
	//                 ||
	//                 ||
	//                 ||
	// graph) もし変更を管理する絶対的な必要がある場合は、それを１箇所に分離しておくことが理想

	// 変更箇所を分離して一つにすることと、複雑さの低減と状態維持との間にある妥協点にたどり着くための戦略

	// 変更の範囲をコントロールする方法は、変更するものを分離しておくこと
	// つまり、任意のオブジェクトをその場で勝手に変更するのではなく、オブジェクトをあらかじめ
	// コンテナに格納しておいて、それを変更すること

	// var container = contain({name: "Lemonjon"});
	// container.set({name: "Lemongrab"});

	// と言う手法と以下の手法との比較となる

	// var being = {name: "Lemonjon"}
	// being.name = "Lemongrab";

	// このような考え方を一歩進めて、変数の変更は関数呼び出しの結果として発生するように制限できる

	// var container = contain({name: "Lemonjon"});
	// container.update(merge, {name: "Lemongrab"});

	// この考え方には二つの効果がある
	// 1つ目は、container#setメソッドのように値を直接書き換えるのではなく、コンテナの現在値といくつかの
	// 引数を渡された関数呼び出しの結果によって変更が起きるようになった
	// 2つ目は、この間接処理を関数レベルで行うことにより、ドメイン特化された制約チェック関数を含めて
	// 考えられる全ての関数によって値の変更が出来るようになった

	// オブジェクトがその場で変更され、それがプログラムの様々な場所で発生していたとすると
	// 値の制約チェックを行うことがどれだけ難しいか

	// コンテナ型のシンプルな実装

	function Container(init) {
		this._value = init;
	};

	var aNumber = new Container(42);
	log("aNumber", aNumber); // =>  {_value: 42}

	// updateメソッドの実装
	Container.prototype = {
		update: function(fun /*, args */) {
			var args = _.rest(arguments);
			var oldValue = this._value;
			this._value = fun.apply(this, construct(oldValue, args));
			return this._value;
		}
	};

	var aNumber = new Container(42);
	aNumber.update(function(n){ return n + 1});
	log("updated aNumber", aNumber); // =>  {_value: 43}

	// 複数の引数を渡す例
	aNumber.update(function(n, x, y, z) { return n / x / y / z}, 1, 2, 3);
	log("updated aNumber", aNumber); // =>  {_value: 7.166666666666667}

	// 制約関数を使った例

	// aNumber.update(_.compose(megaCheckedSqr, always(0)));
	// log("updated aNumber", aNumber); // =>  Erro: 0ではいけません

	aNumber.update(_.compose(megaCheckedSqr, always(2)));
	log("updated aNumber", aNumber); // =>  {_value: 4}


	//******************************************************************************************
	// p221 7.5 まとめ *************************************************************************

	// 純粋関数とは、関数自身がコントロールできる範囲外にあるどの変数も変更せず、返さず、そして
	// 依存することのない関数である。
	// 内部変数を変更する必要がある場合でも外部にその変更が気付かれな場合は大丈夫

	// プログラム内の特定の変更パターンに注意することによって、限りなく不変に近付けることができる
});

$(function(){

	// p223 ８章 フローベースプログラミング

	// 純粋性と隔離された変更を伴う関数を合成することで、どのように「流暢な」プログラミングスタイルを
	// 提供できるか
	// 関数をブロックとして組み合わせるという考え方を関連する例として見ていく


	//******************************************************************************************
	// p223 8.1 チェーン ***********************************************************************

	// condition1関数の実装を振り返ると、検証関数の結果を生成する部分で次のようなコードを書いた
	function condition1(/* １つ以上の検証関数 */) {
		var validators = _.toArray(arguments);

		return function(fun, arg) {
			var errors = mapcat(                                     // <=
				function(isValid) {                                  // <=
					return isValid(arg) ? [] : [isValid.message];    // <= 真偽値でない場合もあるので
				}, validators);                                      // <= JavaScriptの癖を使い２値変換
			if(!_.isEmpty(errors)) {
				throw new Error(errors.join(", "));
			}
			return fun(arg);
		};
	}

	// マップ変換を適用して配列結合
	function mapcat(fun, coll) {
		return cat.apply(null, _.map(coll,fun));
	}

	// このようなコードを書いた理由は最終結果がエラー文字列の配列である必要があった一方、
	// 最終結果に至るまでの中間ステップがエラーメッセージの配列か、もしくは何もない状態の
	// いずれかであったから

	// もう一つの理由は、異なるデータ型を返す異なる動作を統合したかったから

	// もし返されるデータ型が、次の関数の引数として使用できるように統一されているデータ型であれば
	// 関数の合成はもっと簡単にできたはず
	function createPerson() {
		var firstName = "";
		var lastName = "";
		var age = 0;

		return {
			setFirstName: function(fn) {
				firstName = fn;
				return this;
			},
			setLastName: function(ln) {
				lastName = ln;
				return this;
			},
			setAge: function(a) {
				age = a;
				return this;
			},
			toString: function() {
				return [firstName, lastName, age].join(' ');
			}
		};
	}

	var person = createPerson()
					.setFirstName("Mike")
					.setLastName("Fogus")
					.setAge(108)
					.toString();

	log("person", person); // => "Mike Fogus 108"

	// チェーン内のそれぞれのメソッドが同じホストオブジェクトの参照を返す
	// Underscoreでは _.tap, _.chain, _.value という３つの関数がこのパターンを使用している

	// _.chain関数はこれら３つの関数の中でも中心的な役割を果たすもので、あるオブジェクトを
	// この関数の後にチェーンされる（メソッドに擬態した）Underscore関数の暗黙的なターゲットとして
	// 指定できる。

	// 以下、_.chainの動作を理解するためのシンプルな例
	var library = [{title: "SICP", isbn: "0262010771", ed: 1},
					{title: "SICP", isbn: "0262510871", ed: 2},
					{title: "Joy of Clojure", isbn: "1935182641", ed: 1}];

	var result = _.chain(library)
					.pluck("title")
					.sort();
	log("chain test", result); // => {_wrapped: ["Joy of Clojure", "SICP", "SICP"], _chain: true}

	// Underscoreオブジェクト(_)が返される理由
	// _.chain関数はターゲットオブジェクトを引数にとり、Underscoreが持つすべての関数を少し変更した
	// バージョンを格納した他のオブジェクト(ラッパーオブジェクト)にターゲットオブジェクトを取り込みます
	// pluck(array, propertyName)のようなシグネチャ持つ _.pluck のような関数が、_.chainによって使用される
	// ラッパーオブジェクト内では pluck(protertyName) と言うシグネチャを持つバージョンに変更されている

	// Underscoreはこの仕組みを実現するために興味深いテクニックを多数使用している
	// その結果あるラッパーオブジェクトのメソッド呼び出しから次のメソッドの呼び出しに渡されるものは
	// ラッパーオブジェクト自身であり、ターゲットオブジェクトではない

	var result = _.chain(library)
					.pluck("title")
					.sort()
					.value();
	log("chain test", result); // => ["Joy of Clojure", "SICP", "SICP"]
	// _.chainへの呼び出しを終了させるには_.value関数を使って結果の値を抽出する必要がある

	// _.valueを使うことによって、ラッパーオブジェクトの世界に旅立った値を現実の世界に取り戻します

	// _.chain関数を使う場合、おかしな値が返されることがある
	var TITLE_KEY = "titel";

	var result = _.chain(library)
					.pluck(TITLE_KEY)
					.sort()
					.value();
	log("chain spellmiss", result); // => [undefined, undefined, undefined]
	// コードが少ないのでスペルミスだと分かる

	// _.chain関数によるメソッドチェーンが存在する場合、チェーン内の中間結果を簡単に見ることができないのでは？
	// しかし、簡単にデバッグ値を参照できる関数がそんざいする

	// _.tap関数 : オブジェクトと関数を与えられるとそのオブジェクトをターゲットとして関数を実行する
	_.tap([1,2,3], note); // => 情報 : 1,2,3

	var result = _.chain(library)
					.tap(function(o) { log("after chain", o); }) // => [{title: "SICP", isbn: "0262010771", ed: 1}, {title: "SICP", isbn: "0262510871", ed: 2}, {title: "Joy of Clojure", isbn: "1935182641", ed: 1}]
					.pluck(TITLE_KEY)
					.sort()
					.value();
	log("chain spellmiss", result); // => [undefined, undefined, undefined]

	// この結果によるとlibrary配列におかしなところはないようだ

	var result = _.chain(library)
					.pluck(TITLE_KEY)
					.tap(function(o) { log("after pluck", o); }) // => [undefined, undefined, undefined]
					.sort()
					.value();
	log("chain spellmiss", result); // => [undefined, undefined, undefined]

	// _.pluck関数の呼び出しに問題があることがわかる
	// TITLE_KEY もしくは_.pluck自身に問題があるということ
	// この場合は自身がコントロールできる範囲に問題が存在した

	// _.chainには遅延実行が出来ないという制限がある
	// どう言うことか以下に例示
	var result = _.chain(library)
					.pluck("title")
					.tap(function(o){log("cant do Lazy", o)}) // => ["SICP", "SICP", "Joy of Clojure"]
					.sort();
	log("intermidiate value", result); // => {_wrapped: ["Joy of Clojure", "SICP", "SICP"], _chain: true}

	// _.value関数で値を要求するまえに、チェーンの関数が全て実行されてしまっている！！

	//******************************************************************************************
	// p228 8.1.1 レイジーチェーン(遅延実行を行うチェーン)

	// ６章のtrampoline関数の実装で学んだように、遅延実行版の_.chain関数を実装できる
	// _.valueのような結果を要求するような関数が呼び出されるまで実行しない

	function LazyChain(obj) {
		this._calls = [];
		this._target = obj;
	}

	LazyChain.prototype.invoke = function (methodName /* , 任意の引数 */) {
		var args = _.rest(arguments);

		this._calls.push(function(target){
			var meth = target[methodName];

			return meth.apply(target, args);
		});

		return this;
	};

	// LazyChain#invokeメソッドに渡される引数はメソッドの文字列名と、そのメソッドに渡される引数
	// このメソッドは、メソッドの呼び出しをクロージャに「ラッピング」して_calls配列にpushする
	// メソッドが一度呼び出された後、_calls配列がどのように成るかを確認する

	function lazyChain(obj){
		return new LazyChain(obj);
	}

	var result = lazyChain([1,2,3]).invoke("sort")._calls;
	log("push invoke('sort')", result); // [function(target){...}]

	// 配列[1,2,3]をターゲットとしたArray#sortメソッドの遅延呼び出しに対応する関数

	// サンク(thunk) : 後の実行のために動作をラッピングする関数
	// _calls配列に格納されているサンクは、最後のメソッドの呼び出しをうけるオブジェクトとして機能する
	// 中間ターゲットのようなものを受け入れます

	// ここで一度サンクを呼んでみる
	// var result = lazyChain([1,2,3]).invoke("sort")._calls[0](); // => Error: 未定義またなNULL参照のプロパティ'sort'は取得できません
	// log("excute thunks[0]", result);

	// サンクはtargetオブジェクトを引数にとって、それをクロージャメソッドで実行するようになっていた
	// これを動作させるには、オリジナルの配列をサンクの配列として渡す方法を考える必要がある

	// 手動で渡してみる
	var result = lazyChain([2,1,3]).invoke('sort')._calls[0]([2,1,3]);
	log("excute thunks[0]", result); // => [1, 2, 3]

	// _.reduce関数を使うことで、先頭のサンクだけでなく、_calls配列に格納されている全てのサンクに対してループバック引数を適用できる
	LazyChain.prototype.force = function() {
		return _.reduce(this._calls, function(target, thunk) {
			return thunk(target);
		}, this._target);
	};

	var result = lazyChain([2,1,3]).invoke('sort').force();
	log("excute thunks", result); // => [1, 2, 3]

	// チェーンに更に関数を加えてみる

	var result = lazyChain([2,1,3])
					.invoke('concat', [8,5,7,6])
					.invoke('sort')
					.invoke('join', ' ')
					.force();
	log("excute thunks", result); // => "1 2 3 5 6 7 8"

	// チェーンのそれぞれの環が返すデータ型と、次の環に渡すデータ型が合致するように心がけてさえいれば
	// チェーンをどこまでもつなぐことができる

	// 念のために、どのように遅延実行するのかを実際に見てみる
	// LazyChainインスタンスで動作する、遅延実行バージョンのtapを見る

	LazyChain.prototype.tap = function(fun) {
		this._calls.push(function(target) {
			fun(target);
			return target;
		});
		return this;
	};

	var result = lazyChain([2,1,3])
					.invoke('sort')
					.tap(function(o) {log("forced", o)}) // => [1, 2, 3]
					.force();

	// LazyChain#forceを呼ばない場合

	var deferredSort = lazyChain([2,1,3])
					.invoke('sort')
					.tap(function(o) {log("forced", o)}); // => 何も起こらない
	log("not forced", deferredSort); // => LazyChainオブジェクト

	// near but a long time later .....

	log("excute", deferredSort.force());
	// tapが実行され => [1, 2, 3]
	// => [1, 2, 3]

	// この操作はjQueryのpromiseの働きとよく似ている

	// レイジーチェーンに別のレイジーチェーンをチェーンできるように拡張する
	// LazyChainの実体はただのサンクの配列である！！

	function LazyChains(obj) {
		var isLC = (obj instanceof LazyChain);

		this._calls = isLC ? cat(obj._calls, []) : [];
		this._target = isLC ? obj._target : obj;
	}

	LazyChains.prototype = LazyChain.prototype;

	function lazyChains(obj) {
		return new LazyChains(obj);
	}

	// コンストラクタに渡された引数がLazyChainのインスタンスであれば、そのチェーンと
	// ターゲットオブジェクトを新しいインスタンスに設定する。

	var extendedChain = lazyChains(deferredSort)
							.invoke("toString");
	log("excute extendedChain", extendedChain.force());
	// => tapの実行で forced: [1, 2, 3]
	// => excute extendedChain: "1,2,3"

	// LazyChainを更に拡張して、結果をキャッシュしたり、メソッドの指定を文字に頼らないインターフェイスを
	// 提供することが出来る

	// 課題 : そのような拡張の実装

	//******************************************************************************************
	// p234 8.1.2 Promise

	// jQueryにはLazyChainと似ていて多少異なるpromiseと呼ばれる仕組みが既に実装されている
	// promiseは、メインプログラムロジックと平行して動作する非同期オペレーションのための
	// 「流暢な」APIを提供するもの

	// promiseは未消化の活動を表している
	// 以下のコードに見られるように $.Deferredを使ってpromiseを生成する

	var longing = $.Deferred();

	// Deferredからpromiseを取得できる

	log("promise", longing.promise());
	// => {state:function(){...... } // 未消化アクションを保持したオブジェクト

	log("promise state", longing.promise().state()); // => "pending"

	// まだ実行されていないので、promiseは未実行(pending)状態

	longing.resolve("<3");

	log("promise state", longing.promise().state()); // => "resolved"

	// promise は実行され、値にアクセスできるようになった

	longing.promise().done(partial(log, "info")); // => <3
	// promiseが返る

	// Deferred#doneメソッドはDeferredオブジェクトに用意されている様々な有用なメソッドの一つ

	// jQueryでpromiseを作成する方法として、次の例のように$.when関数を使ってpromiseチェーンを開始する方法がある

	function go(){
		var d = $.Deferred();

		$.when("")
				.then(function () {
					setTimeout(function () {
							console.log("sub-task 1");
					}, 1000)
				})
				.then(function(){
					setTimeout(function (){
							console.log("sub-task 2");
					}, 2000)
				})
				.then(function(){
					setTimeout(function (){
							d.resolve("done done done");
					}, 3000)
				});
		return d.promise();
	}

	// ここでは開始時間が異なる３つの非同期タスクを開始するようにjQueryで記述している
	// Deferred#thenメソッドは関数を引数に取り、すぐに実行します

	// そして開始時間が一番遅くに設定されているタスクがDeferredインスタンスdを解決します

	// var yearning = go().done(partial(log, "go"));

	// done関数に関数を渡すことにより、promiseが解決された時点で呼び出される関数を付与した
	// しかしgo()が実行された直後には何も起こらない
	// これはサブタスクで呼ばれているstTimeoutのためで、コンソールへの出力がまだ行われていない

	// このときのpromiseの状態をstateメソッドで確認
	// log("yearning.state() start", yearning.state()); // => "pending"
	// setTimeout(function() {log("yearning.state() doing", yearning.state())}, 2000); // => "pending"
	// setTimeout(function() {log("yearning.state() doing", yearning.state())}, 4000); // => "resolved"

	// LazyChainは厳密な連続呼び出しを表現しており、forceメソッドが呼び出されるたびに値を計算する
	// promiseは連続呼び出しを表現しているが、その連続呼び出しが解決された後はその結果値をいつでも取得できる

	// これに加えてjQueryのPromiseオブジェクトは、非同期のサブタスクによって構成されるタスクの集合を定義するように
	// 設計されている
	// 可能な場合、サブタスクはそれぞれ並列に実行される
	// しかし、このタスク集合は全てのサブタスクが終了し、かつresolveメソッドを呼ぶことで結果値がpromiseに
	// 渡されなければ完了とみなされない

	// LazyChainも複数のサブタスクによって構成されるタスクの集合を現すが、一度実行(force)されると常に
	// チェーンの順番に実行される

	// レイジーチェーンは連続性の高いタスクの集まり
	// プロミスは緩く関連したタスクの集まりを扱う

	// 最近のバージョンのjQueryでは殆どの非同期APIコールがpromiseを返す
	// したがって、非同期コールの結果はpromiseのAPIのルールでチェーンすることが可能


	//******************************************************************************************
	// p238 8.2 パイプライン *******************************************************************

	// Underscoreは、その関数の殆どが第１引数にコレクションを取るという特性を活かして
	// _.chain関数によってチェーンを実装している

	// 対照的に本書では第１引数に関数を取ることで、部分適用とカリー化を容易にするために選択したもの

	// メソッドチェーンには様々な欠点がある
	// e.g. オブジェクトのsetとgetのロジックが堅く連結されてしまうこと(コマンドとクエリの分離)
	//      ぎこちないネーミングの問題
	// メソッドチェーンにおける一番大きな問題は、一つの呼び出しから次の呼び出しに移る際に、
	// 共通の参照を変更してしまうこと

	// 一方関数型APIでは参照ではなく値そのものを操作し、微妙にデータを変換して新しい結果値を返す

	// 関数型のコードにおけるチェーンは、期待されるデータ値が入力されると、非破壊的変換を行い、そして
	// 新しいデータを返す。このような動作が最初から最後まで連続するもの

	// そのような変換処理を行うパイプラインの「間違った」APIは以下のようなもの

	// pipeline([2,3,null,1,42,false]
	//    , _.compact
	//    , _.initial
	//    , _.rest
	//    , rev);  // => [1,3]

	// このパイプラインで行われる連続処理は文章で以下のように表現できる
	// 1. 配列[2,3,null,1,42,false]を引数にとり_.compactに渡す
	// 2. _.compact関数の戻り値を_.initial関数に渡す
	// 3. _.initial関数の戻り値を_.rest関数に渡す
	// 4. _.rest関数の戻り値をrev関数に渡す
	//
	// そしてこのパイプラインは次のようなネスト構造で記述できる
	// rev(_.rest(_.initial(_.compact([2,3,null,1,42,false])))); => [1, 3]

	// この表現はLazuChain#forceの説明と殆ど同じ

	// どちらのアルゴリズムも関数呼び出しと結果値が交互に出現する構造である
	// よって本来のpipelineの実装は自然とLazyChain#forceと似たものになる
	function pipeline(seed /*, 任意の数の関数 */) {
		return _.reduce(_.rest(arguments),
			function(l,r) {return r(l)},
			seed);
	}

	log("pipeline()", pipeline()); // => undefined
	log("pipeline(42)", pipeline(42)); // => 42
	log("pipeline(42, function(n) {return -n})", pipeline(42, function(n) {return -n})); // => -42

	// パイプラインは遅延実行を行わないこと、参照ではなく値そのものを扱う
	// 上記を除けばレイジーチェーンと似ているといえる

	// しかし、パイプラインは_.composeで合成された関数により近いもの
	// パイプラインに遅延実行させるには次のように関数にカプセル化するだけ
	// (サンクに入れてもよい)

	function fifth(a) {
		return pipeline(a
				,_.rest
				,_.rest
				,_.rest
				,_.rest
				,_.first);
	}

	log("Lazy pipeline", fifth([1,2,3,4,5])); // => 5

	// パイプラインを使って構築した抽象を他のパイプラインに挿入するというような強力なテクニックもある
	function negativeFifth(a) {
		return pipeline(a
					, fifth
					, function(n){return -n});
	}
	log("negativeFifth", negativeFifth([1,2,3,4,5])); // => -5


	// 「流暢な」APIを生成する例
	var library = [{title: "SICP", isbn: "0262010771", ed: 1},
					{title: "SICP", isbn: "0262510871", ed: 2},
					{title: "Joy of Clojure", isbn: "1935182641", ed: 1}];

	function firstEditions(table) {
		return pipeline(table
			, function(t) { return as(t, {ed: 'edition'})}
			, function(t) { return project(t, ['title','edition','isbn'])}
			, function(t) { return restrict(t, function(book){
										return book.edition === 1;
			});
		});
	}

	log("firstEditions(library)", firstEditions(library));
	// => [{title: "SICP", edition: 1, isbn: "0262010771"}, {title: "Joy of Clojure", edition: 1, isbn: "1935182641"}]

	// pipeline関数の問題は、パイプライン内の関数が引数をひとつしか取らないこと
	// 関係演算子は2つの引数を取るため、これらをパイプラインないで動作させるためには
	// アダプタとなる関数でラッピングしなければならない

	// しかし関係演算子は一貫性のあるインターフェイスを持つように設計されている
	// １つ目の引数はテーブルデータ、２つ目の引数は変更内容です

	// この一貫性を利用してcurry2関数を使用してカリー化されたバージョンの「流暢な」関係演算子を次のように作成できる
	var RQL = {
		select: curry2(project),
		as: curry2(as),
		where: curry2(restrict)
	};

	// SQLに近付いた命名をしたカリー化関数によってより読みやすくなる
	function allFirstEditions(table) {
		return pipeline(table
					, RQL.as({ed: 'edition'})
					, RQL.select(['title', 'edition', 'isbn'])
					, RQL.where(function(book){return book.edition === 1})
				);
	}

	log("allFirstEditions", allFirstEditions(library));
	// => [{title: "SICP", edition: 1, isbn: "0262010771"}, {title: "Joy of Clojure", edition: 1, isbn: "1935182641"}]

	// コードは人が読みやすいように書くべきである

	// 本書で定義されている関数はパイプライン内で動作するように設定されている

	// 関数型プログラミングは、ある関数から次の関数へ流れるにしたがって、データを変換することに焦点を
	// 当てているものの、間接参照や深い入れ子関数によってその焦点があいまいになってしまう

	// パイプラインを使うことによりデータフローがより明確になる

	// しかしI/OやAjaxコール、そして変異のように副作用を伴うような場面ではパイプラインを使うことは殆どない
	// 戻り値がないケースが多いからです

	//******************************************************************************************
	// p244 8.3 データフローvsコントロールフロー(制御構造) *************************************

	// 合成可能かつ「流暢に」副作用を実行する方法

	// LazyChain関数の例では、実行仕様(.invoke)と実行ロジック(.force)を分離した
	// pipeline関数では、純粋関数を多数並べてパイプラインのような連続処理を実現した

	// LazyChain関数ではforceが呼ばれるまで常にLazyChainのようなオブジェクトを返していた => 共通の参照
	// pipeline関数では、ある処理の結果として中間のデータ型が変更されてしまう可能性はあったが
	// 関数を合成する前にあらかじめデータ型を知っておくことで適切な値の受け渡しが確実にできる => 参照でなく値

	// では、合成することを念頭に置かずに定義されて関数を合成するにはどうすれば良いか

	// 本節では、遅延実行を行う新しい種類のパイプラインを使い、異なる型の戻り値を持ったさまざまな関数を
	// 合成するテクニックを見ていく
	// このようなテクニックをactionと呼ぶ

	// データの形が一致しなければpipelineも_.composeもlazyChainも期待通りの動作を行わない
	function sqr(n) {return n*n}
	var result = pipeline(42
		             , sqr
		             , note
		             , function(n) {return -n});
	log("inValid dataFlow", result);
	// => 情報: 1764
	// => inValid dataFlow: NaN

	// noteの実行時にデータ型がundefinedに変わってしまった

	// noteの戻り値を与えられたものをそのまま返すように変更することも出来るが対処療法である(関数に手を加えられない場合もある)
	// 互換性のないデータ型を返す関数や、値を返さない関数が存在することでコントロールフローが難しくなる

	// 処理間を流れるデータの形状を一定にする方法を見つけることで解決をはかる

	//******************************************************************************************
	// p247 8.3.1 共通の形をみつける

	// 異なるノード間を流れる共通の形を決める際の複雑さは、データ型を決めることではなく、その中に何を入れるか

	// negativeSqr の例では
	// {values: [42, 1764, undefined, -1764]} // リターンキャッシュ

	// 他に持っていて有利なデータは･･･状態か、もしくは処理間で共通のターゲットオブジェクト

	// {values: [42, 1764, undefined, -1764], state: -1764} // コンテクストオブジェクト

	// valuesの最後の値を取り出すか、現在の状態を取り出すことで最終結果を得る

	// これらの中間状態を管理するaction関数の実装は、pipelineとlazyChainのハイブリッドになる

	function actions(acts, done) {
		return function(seed) {
			var init = {values: [], state: seed};

			var intermediate = _.reduce(acts, function(stateObj, action) {
				var result = action(stateObj.state);
				var values = cat(stateObj.values, [result.answer]);
				return { values: values, state: result.state};
			}, init);

			var keep = _.filter(intermediate.values, existy);

			return done(keep, intermediate.state);
		};
	}

	function mSqr() {
		return function(state) {
			var ans = sqr(state);
			return {answer: ans, state: ans};
		};
	}

	var doubleSquareAction = actions([mSqr(), mSqr()], function(values) {return values;});

	log("doubleSquareAction(10)", doubleSquareAction(10)); // => [100, 10000]

	// 異なる形を持った関数を混ぜる
	function mNote() {
		return function(state) {
			note(state);
			return {answer: undefined, state: state};
		};
	}

	function mNeg() {
		return function(state) {
			return {answer: -state, state: -state};
		};
	}

	var negatibeSqrAction = actions([mSqr(), mNote(), mNeg()], function( _, state) { return state; });

	log("negatibeSqrAction", negatibeSqrAction(9));
	// => 情報 : 81
	// => negatibeSqrAction: -81

	//******************************************************************************************
	// p252 8.3.2 アクション生成をシンプルにする関数

	// 2つの関数を引数に取るlift関数を定義
	// 1つ目の関数は、値を与えられて何かのアクションの結果を提供する関数
	// 2つ目の関数は、新しいstateを提供する関数

	function lift(answerFun, stateFun) {
		return function(/* 任意の数の引数 */) {
			var args = _.toArray(arguments);

			return function(state) {
				var ans = answerFun.apply(null, construct(state, args));
				var s = stateFun ? stateFun(state) : ans;

				return {answer: ans, state: s};
			};
		};
	}

	var mSqr2 = lift(sqr);
	var mNote2 = lift(note, _.identity);
	var mNeg2 = lift(function(n) {return -n});

	// answerとstateが同じ値の場合はanswerを提供する関数のみ
	// mNoteのanswer(undefined)はstateの値と異なるため、_.identitiyを使ってバイスルーのアクションを設定

	var negativeSqrAction2 = actions([mSqr2(), mNote2(), mNeg2()], function(notUsed, state){return state});

	log("negativeSqrAction2(100)", negativeSqrAction2(100));
	// => 情報: 10000
	// => negativeSqrAction2(100): -10000

	// スタック動作を行う関数の定義
	var push = lift(function(stack, e) {return construct(e, stack)});
	var pop = lift(_.first, _.rest);

	var stackAction = actions([push(1), push(2), pop()], function(values, state){return values});
	// actions関数を使うと、連続したスタックイベントをまだ実現していない値としてキャプチャしておくことができる
	log("stackAction([])", stackAction([])); // => [[1],[2, 1],[2]]

	// 他の関数と合成してみる
	pipeline(
		[]
		, stackAction
		, _.chain)
		.each(function(elem){
			log("stack", elem);
		});
	// => stack: [1]
	// => stack: [2, 1]
	// => stack: 2

	// 共通の中間形を定義して、liftやactionsのような関数を使って管理することによって
	// 異なる形の関数を合成することができる
	// この管理は、一般的にコントロールフロー内で型を一定に保つという問題を、データフローの問題に転換することが出来た

	//******************************************************************************************
	// p255 8.4 まとめ *************************************************************************

	// チェーン
	// メソッドチェーン : this参照のみを返すオブジェクトメソッドを書くことにより、ルールを共有するメソッドを
	//                    連続して呼ぶことができる仕組み
	// jQueryのpromiseやUnderscoreの_.chain関数を使って、チェーンの概念を説明した
	// ある共通のターゲットに対していくつかの連続したメソッド呼び出しを遅延実行するためのレイジーチェーンの考え方を説明

	// パイプライン : 一方からデータを入力すると、変換されたデータを反対側から出力するような関数呼び出しの連続
	//               チェーンと異なり、共通の参照ではなく、配列やオブジェクトといったデータを扱う
	//               パイプラインを流れるデータのタイプは、次の関数が受け取ることが出来るのであれば、パイプラインの
	//               途中で変更することも出来る
	//               パイプラインは純粋性を持つので元のデータは非破壊

	// アクション
	// チェーンとパイプラインは両方とも既知の参照もしくはデータ型を扱うが、アクションの連続と言う考え方は
	// データ型に制限されることはありません
	// その代わり、actions関数を型として実装して、内部のデータ構造の管理詳細を隠蔽し、ことなる型の引数を取り、
	// 異なる型の値を返す関数をミックスするために使った

});
