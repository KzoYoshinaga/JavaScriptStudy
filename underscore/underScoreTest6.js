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