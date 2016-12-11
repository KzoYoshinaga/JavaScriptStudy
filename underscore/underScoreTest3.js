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