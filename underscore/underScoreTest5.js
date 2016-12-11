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