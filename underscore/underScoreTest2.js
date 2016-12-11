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