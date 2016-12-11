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