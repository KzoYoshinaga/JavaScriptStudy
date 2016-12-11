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