// 与えられた関数に最初の引数を部分適用
function partial1(fun, arg) {
	return function(/* １つ以上の引数 */) {
		var args = construct(arg1, arguments);
		return fun.apply(fun, args);
	};
} 

// マップ変換を適用して配列結合
function mapcat(fun, coll) {
	return cat.apply(null, _.map(coll,fun));
}

// 検証関数を作成するための、ひと目でわかるようなAPIを提供する
function validator(message, fun) {
	var f = function(/* args */) {
		return fun.apply(fun, arguments);
	};
	f['message'] = message;
	return f;
};

// 検証機能つきアプライ関数
function condition1(/* １つ以上の検証関数 */) {
	var validators = _.toArray(arguments);
	
	return function(fun, arg) {
		var errors = mapcat(
			function(isValid) {
				return isValid(arg) ? [] : [isValid.message];
			}, validators);
		if(!_.isEmpty(erros)) {
			throw new Error(errors.join(", "));
		}
		return fun(arg);
	};
}

