// ログ出力
function log(text, result) {
	console.log(text + ": " + objString(result));
	return result;
}

// オブジェクト表示
function dumpObj(obj) {
	console.log(objText(obj));
}

// オブジェクトを渡されたら再帰的にオブジェクトを表示
// プリミティブ : _.isObject(obj) = false
// 配列         : _.isArray(obj) = ture
function objText(obj) {
	if(!_.isObject(obj)){
		if(_.isString(obj)) return ['"',obj,'"'].join("");
		if(typeof(obj) == "undefined") return "undefined";
		if(obj == null) return "null";
		return obj;
	}
	
	if(_.isArray(obj)){
		return ["[", _.map(_.values(obj), objText).join(", ") ,"]"].join("");
	}else{
		if(typeof(obj) == "function") return obj;
		
		var properties = _.map(_.zip(_.keys(obj), _.map(_.values(obj), objText)), function(arry){return arry.join(": ")} );
		return ["{", properties.join(", ") ,"}"].join("");
	}
}

// 関数型アプローチobjText
var objString = dispatch(
	function(s) { return _.isString(s) ? stringTo(s) : undefined },             // 非オブジェクト
	function(s) { return typeof(s) == "undefined" ? "undefined" : undefined },  //
	function(s) { return s == null ? "null" : undefined },                      //
	function(s) { return typeof(s) == "function" ? s : undefined },             // オブジェクト
	function(s) { return _.isArray(s) ? arrayTo(s) : undefined },               //
	function(s) { return _.isObject(s) ? objectTo(s) : s } 
);
function stringTo(s) { return ['"', s,'"'].join("") }
function arrayTo(ary) { return ["[", _.map(ary, objString).join(",") ,"]"].join("") }
function objectTo(o) {
	var properties = _.map(_.zip(_.keys(o), _.map(_.values(o), objString)), function(arry){return arry.join(":")} );
	return ["{", properties.join(",") ,"}"].join("");
}
 
// 配列ペアを分離
function constructPair(pair, rests){
	return [construct(_.first(pair), _.first(rests)),
			construct(second(pair), second(rests))];
}

// unzip : _.zip関数の逆操作
function unzip(pairs) {
	if(_.isEmpty(pairs)) return [[],[]];
	
	return constructPair(_.first(pairs), unzip(_.rest(pairs)));
}

// エラー出力
function fail(thing) {
	throw new Error(thing);
}

// ワーニング出力
function warn(thing) {
	console.log(["警告 :", thing].join(" "));
}

// ノーテーション出力
function note(thing) {
	console.log(["情報 :", thing].join(" "));
}

// Javascriptの癖の矯正
function existy(x) {return x != null};
function truthy(x) {return ( x != false) && existy(x)};

// 真偽反転
function not(x) { return !x; }

// 偶数奇数判定
function isEven(n) { return n%2 === 0; }
function isOdd(n) { return n%2 === 1; }

// インデックス指定可能判定
function isIndexed(data) {
	return _.isArray(data) || _.isString(data);
}

// 配列のn番目の要素を取得
function nth(a, index) {
	if(!_.isNumber(index)) fail("インデックスは数値である必要があります");
	if(!isIndexed(a)) fail("インデックス指定可能ではないデータ型はサポートされていません");
	if((index < 0) || (index > a.length -1)) fail("指定されたインデックスは範囲外です");
	return a[index];
}

// 配列の２番目の値
function second(a) {
	return nth(a, 1);
}

// 1からnまでのランダムな値を得る
function rand(n) {
	return parseInt( Math.random * 2);
}

// 引数を配列で受け適用する
function splat(fun) {
	return function(array) {
		return fun.apply(null, array);
	};
}

// 配列の結合
function cat(/* いくつかの配列 */) {
	var head = _.first(arguments);
	if(existy(head))
		return head.concat.apply(head, _.rest(arguments));
	else
		return [];
}

// マップ変換を適用して配列結合
function mapcat(fun, coll) {
	return cat.apply(null, _.map(coll,fun));
}

// 配列の先頭に要素を追加
function construct(head, tail) {
	return cat([head], _.toArray(tail));
}

// 配列として与えられた数値の平均値を返す
function average(array) {
	var sum = _.reduce(array, function(a,b){return a+b});
	return sum / _.size(array);
}

// オブジェクトまたは配列から値を取り出す
function plucker(FIELD) {
	return function(obj) {
		return (obj && obj[FIELD]);
	};
}

// 条件に合えば指定されたアクション実行結果を返す
function doWhen(cond, action) {
	if(truthy(cond))
		return action();
	else
		return undefined;
}

// p107
// メソッドを引数に取り、ターゲットとなるオブジェクトでそのメソッドを実行する関数を返す
function invoker(NAME, METHOD) {
	return function(target /* 任意の数の引数 */) {
		if(!existy(target)) fail("Must provide a target");
		
		//log("target", target); // [1,2,3]
		
		var targetMethod = target[NAME]; 
		//log("targetMethod", targetMethod); // function reverse(){ ... }
		
		var args = _.rest(arguments);
		//log("rest arguments", args); // [0,1,2,3]  <- 0,[[1,2,3]] フラットにされている 0:添え字 [[1,2,3]]:オブジェクトそのもの
		
		var isValidMethod = (existy(targetMethod) && METHOD === targetMethod);
		var actionFun = function() { return targetMethod.apply(target, args);}
		return doWhen(isValidMethod, actionFun); // doWhen(cond,action) : cond == true で action()結果を返す
	};
};

// 常に設定された値を返す関数を返す
function always(VALUE) {
	return function() {
		return VALUE;
	};
};

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

// 検証関数を作成するための、ひと目でわかるようなAPIを提供することが有効である
function validator(message, fun) {
	var f = function(/* args */) {
		return fun.apply(fun, arguments);
	};
	f['message'] = message;
	return f;
};

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
};

// カリー化 : 関数の引数をひとつだけに固定
function curry(fun) {
	return function(arg) {
		return fun(arg);
	};
}

function curry2(fun) {
	return function(second) {
		return function(first){
			return fun(first, second);
		};
	};
}

function curry3(fun) {
	return function(last) {
		return function(middle) {
			return function(first) {
				return fun(first, middle, last);
			};
		};
	};
}

// 部分適用
function partial1(fun, arg1) {
	return function(/* １つ以上の引数 */) {
		var args = construct(arg1 , arguments);
		return fun.apply(fun, args);
	};
}

function partial2(fun, arg1, arg2) {
	return function(/* args */) {
		var args = cat([arg1, arg2], arguments);
		return fun.apply(fun, args);
	};
}

function partial(fun /*, 任意の数の引数 */) {
	var pargs = _.rest(arguments);
	
	return function(/* 引数 */) {
		var args = cat(pargs, _.toArray(arguments));
		return fun.apply(fun, args);
	};
}

// オブジェクトであるか検証
function aMap(obj) {
	return _.isObject(obj);
}

// プレディケート関数の結果を反転34
function complement(pred) {
	return function() {
		return !pred.apply(null, _.toArray(arguments));
	};
}

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

// 配列の反転
var rev = invoker('reverse', Array.prototype.reverse);

// 任意の引数のすべてにクロージングされたプレディケート関数を適用しすべてがtrueでtrueを返す関数を返す
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

// 任意の引数のすべてにクロージングされたプレディケート関数を適用しいづれか一つでもtrueがあればtrueを返す関数を返す
function orify(/* 任意のプレディケート関数 */) {
	var preds = _.toArray(arguments);
	
	return function(/* 任意の数の引数 */) {
		var args = _.toArray(arguments);
		
		var everything = function(ps, truth) {
			if(_.isEmpty(ps))
				return truth;
			else
				return _.som(args, _.first(ps)) || everything(_.rest(ps), truth);
		};
		return everything(preds, false);
	};
}

// 渡された関数を任意の回数実行し結果を配列で返す
function repeatedly(times, fun) {
	return _.map(_.range(times), fun);
}

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

// _.extendを使ってオブジェクトを結合する新たな関数mergeを変わりに定義する
function merge(/* 任意の数のオブジェクト */) {
	return _.extend.apply(null, construct({}, arguments));
}

// 一つ以上の関数を引数に取り、それらの関数をundefined以外の値が返されるまで順番に呼び出す
// リターントラップとして使えるよ
function dispatch(/* 任意の数の関数 */){
	var funs = _.toArray(arguments);
	var size = funs.length;
	
	return function(target /*, 追加の引数 */) {
		var ret = undefined;
		var args = _.rest(arguments);
		
		for(var funIndex = 0; funIndex < size; funIndex++) {
			var fun = funs[funIndex];
			ret = fun.apply(fun, construct(target, args));
			
			if(existy(ret)) return ret;
		}
		return ret;
	};
}

var str = dispatch(invoker('toString', Array.prototype.toString),
					invoker('toString', String.prototype.toString));

// **************************************************************************
// SQLライクな関数 **********************************************************
// SELECT
function project(table, keys) {
	return _.map(table, function(obj) {
		return _.pick.apply(null, construct(obj, keys));
	});
}
// AS
function rename(obj, newNames) {
	return _.reduce(newNames, function(o,nu,old){
		if(_.has(obj, old)) {
			o[nu] = obj[old];
			return o;
		}
		else
			return o;
	},
	_.omit.apply(null, construct(obj, _.keys(newNames))));
}

function as(table, newNames) {
	return _.map(table, function(obj) {
		return rename(obj, newNames);
	});
}
// WHERE
function restrict(table, pred) {
	return _.reduce(table, function(newTable, obj) {
		if(truthy(pred(obj)))
			return newTable;
		else
			return _.without(newTable, obj);
	}, table);
}

// 使用例
// function allFirstEditions(table) {
//  return pipeline(table
//              , RQL.as({ed: 'edition'})
//              , RQL.select({['title', 'edition', 'isbn']})
//              , RQL.where(function(book){return book.edition === 1})
//           );
// }

// **************************************************************************
// predicate関数
function zero(n) {
	return n === 0;
}

function greaterThan(n) {
	return function(arg) {
		return arg > n;
	};
}

function lessThan(n) {
	return function(arg) {
		return arg < n;
	};
}

function equal(n) {
	return function(arg) {
		return arg === n;
	};
}

// **************************************************************************
// 制約なし二乗関数
function uncheckedSqr(n) { return n * n };

// 二乗引数の制約関数
var sqrPre = condition1(
	validator("０ではいけません", complement(zero)),
	validator("引数は数値である必要があります", _.isNumber)
);

// 事前制約つき二乗関数
var checkedSqr = partial1(sqrPre, uncheckedSqr);

// 二乗結果の制約関数
var sqrPost = condition1(
	validator("結果は数値である必要があります", _.isNumber),
	validator("結果はゼロでない必要があります", complement(zero)),
	validator("結果は正の数である必要があります", greaterThan(0)));

// 事後条件つき二乗関数
var megaCheckedSqr = _.compose(partial(sqrPost,_.identity), checkedSqr);

// **************************************************************************
// レイジーチェーン

// 使用例
// var result = lazyChain([2,1,3])
// 				.invoke('concat', [8,5,7,6])
// 				.invoke('sort')
// 				.invoke('join', ' ')
// 				.force();
// log("excute thunks", result); // => "1 2 3 5 6 7 8"

function LazyChain(obj) {
	this._calls = [];
	this._target = obj;
}

// １つ目の引数でメソッドを文字列で指定
// ２つ目以降にメソッドに渡す引数を師弟
LazyChain.prototype.invoke = function (methodName /* , 任意の引数 */) {
	var args = _.rest(arguments);
	
	this._calls.push(function(target){
		var meth = target[methodName];
		
		return meth.apply(target, args);
	});
	
	return this;
};

// 遅延実行版tap
LazyChain.prototype.tap = function(fun) {
	this._calls.push(function(target) {
		fun(target);
		return target;
	});
	return this;
};

// 実行エンジン
LazyChain.prototype.force = function() {
	return _.reduce(this._calls, function(target, thunk) {
		return thunk(target);
	}, this._target);
};


// チェーンを更に繋ぐ
// 使用例
//var extendedChain = lazyChains(deferredSort)   // defferredSort : force()を実行していないlazyChainオブジェクト
//							.invoke("toString");
//	log("excute extendedChain", extendedChain.force());

function LazyChains(obj) {
	var isLC = (obj instanceof LazyChain);
	
	this._calls = isLC ? cat(obj._calls, []) : [];
	this._target = isLC ? obj._target : obj;
}

LazyChains.prototype = LazyChain.prototype;

function lazyChains(obj) {
	return new LazyChains(obj);
}

// LazyChain型隠蔽版レイジーチェーン
// 注 : calls配列がプライベートであるため他のレイジーチェーンと結合することが難しくなる
//      実現するにはforceメソッドを変更してレイジーチェーンの結果を次のレイジーチェーンに渡すようにする必要がある
function lazyChain(obj) {
	var calls = [];
	
	return {
		invoke: function(methodName /*, 任意の引数 */) {
			var args = _.rest(arguments);
			calls.push(function(target) {
				var meth = target[methodName];
				return meth.apply(target, args);
			});
			return this;
		},
		force: function() {
			return _.reduce(calls, function(ret, thunk){
				return thunk(ret);
			}, obj);
		}
	};
}
// 使用例
//	var lazyOp = lazyChain([2,1,3])
//					.invoke("concat", [7,7,9,0])
//					.invoke("sort");
//	log("lazyOp", lazyOp.force()); // => [0, 1, 2, 3, 7, 7, 9]

// レイジーチェーンの生成を関数に格納しておくことにより、オブジェクトのデータ型に依らないように遅延実行する
// オペレーションを汎用化できる
//    function deferredSort(ary) {
//		return lazyChain(ary).invoke("sort");
//  }
    
// 通常の関数呼び出しで、配列のソートを遅延実行する関数を生成できる
//    var deferredSorts = _.map([[2,1,3],[7,7,1],[0,9,5]], deferredSort);
//    
// メソッド呼び出しをカプセル化
//    function force(thunk) {
//   	return thunk.force();
//    }
    
// 実行
// log("_.map(deferredSorts, force)", _.map(deferredSorts, force)); // => [[1, 2, 3], [1, 7, 7], [0, 5, 9]]



// **************************************************************************
// パイプライン 遅延実行を行わない、参照ではなく値を扱う
// 使用例
// log("pipeline()", pipeline()); // => undefined
// log("pipeline(42)", pipeline(42)); // => 42
// log("pipeline(42, function(n) {return -n})", pipeline(42, function(n) {return -n})); // => -42

// 遅延実行させるには関数でカプセル化
// function fifth(a) {
//      return pipeline(a
//              ,_.rest
//              ,_.rest
//              ,_.rest
//              ,_.rest
//              ,_.first);
// }
// log("Lazy pipeline", fifth([1,2,3,4,5])); // => 5

// パイプラインを使って構築した抽象を他のパイプラインに挿入
// function negativeFifth(a) {
//      return pipeline(a
//              , fifth
//              , function(n){return -n});
// }
// log("negativeFifth", negativeFifth([1,2,3,4,5])); // => -5

function pipeline(seed /*, 任意の数の関数 */) {
	return _.reduce(_.rest(arguments),
		function(l,r) {return r(l)},
		seed);
}

// **************************************************************************
// アクション関数 データ型が異なる関数の合成
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

// アクション関数定義
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

// 使用例
// var mSqr2 = lift(sqr); // answerとstateが同じ値の場合はanswerを提供する関数のみ
// var mNote2 = lift(note, _.identity); // mNoteのanswer(undefined)はstateの値と異なるため、_.identitiyを使ってバイスルーのアクションを設定
// var mNeg2 = lift(function(n) {return -n});

// var negativeSqrAction2 = actions([mSqr2(), mNote2(), mNeg2()], function(notUsed, state){return state});
// log("negativeSqrAction2(100)", negativeSqrAction2(100));
// => 情報: 10000
// => negativeSqrAction2(100): -10000

// **************************************************************************
// バリデーター


