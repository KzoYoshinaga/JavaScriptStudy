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