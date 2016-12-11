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