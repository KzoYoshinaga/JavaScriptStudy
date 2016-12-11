$(function(){
	
	// p257 ９章 クラスを使わないプログラミング
	
	// 関数とシンプルなデータに則って考えることは大切だが
	// 自分でカスタム抽象を組み立てなければならない時がくる
	// その時のために、個別の動作を「ミックス」することによって、より複雑な動作を組み立てる方法について見ていく
	
	// そのようなカスタム化の詳細をユーザから隠蔽するような関数型のAPIを記述する手段について見ていく
	
	
	//******************************************************************************************
	// p257 9.1 データ指向 *********************************************************************
	
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
	
	// 8章のLazyChain関数との違い
	// ・関数呼び出しによってレイジーチェーンが初期化される
	// ・コールチェーン(calls配列)がプライベートデータである
	// ・LazyChain型が明示的に存在しない
	
	// 注 : calls配列がプライベートであるため他のレイジーチェーンと結合することが難しくなる
	//      実現するにはforceメソッドを変更してレイジーチェーンの結果を次のレイジーチェーンに渡すようにする必要がある
	
	var lazyOp = lazyChain([2,1,3])
					.invoke("concat", [7,7,9,0])
					.invoke("sort");
	log("lazyOp", lazyOp.force()); // => [0, 1, 2, 3, 7, 7, 9]
	
	// 明示的なデータ型の定義は、本当に必要な時が来るまで待ったほうがいい
	// その代わりに、抽象化のためのプログラミングに重きを置く
	
	// JavaScriptは、名前つきデータ型や型階層を作る必要性を抑えるための様々な手段を提供する
	// ・プリミティブデータ型
	// ・複合型(オブジェクトと配列)
	// ・ビルトインデータ型を使用する関数
	// ・メソッドを格納できる無名オブジェクト
	// ・型付きオブジェクト
	// ・クラス
	
	//                    プリミティブ                   
	//                         |                         
	//        ----------------------------------         
	//        |                                |         
	//        v                                v         
	// [ プリミティブ ]                 { プリミティブ } 
	//        |                                |         
	//        ----------------------------------         
	//                         |                         
	//                         v                         
	//                 上記を使った関数                  
	//                         |                         
	//                         v                         
	//                  無名オブジェクト                 
	//                         |                         
	//                         v                         
	//                  型付きオブジェクト               
	//                         |                         
	//                         v                         
	//                      クラス                       
    //                                                   
    // graph) データ指向の「階層」                       
    // JavaScriptでAPIを実装する際のチェックリストになる 
    
    // クラス構築から始めると抽象化のための残されている余裕を最初から使い切ってしまう
    // その代わり、ビルトインのデータ型から始めて、流暢で関数型のAPIと組み合わせることから始めると
    // 拡張のための柔軟性が手に入る
    
    
    //******************************************************************************************
	// p257 9.1.1 関数型を目指して構築
    
    // プログラミングにおける作業では、何らかの計算のさなかに発生するアクティビティが最も大切(Elliot2010)
    
    // e.g. フォームに入力された文字列を読み込んで、検証して、別のデータ型に変換し、計算処理を実行して、
    //      計算された新しい値を文字列に変換して送る、と言う一連の動作を想像する
    //      文字列を読み込む動作と、文字列に変換する動作は、検証とデータ処理の部分に比べると比較的小さいものである
    
    // レイジーチェーンはオブジェクト中心の考え方であり操作のためにメソッドを連ねる必要がある
    // 以下３ステージに分けられる
    // 1. 何らかのオブジェクトを取得
    // 2. このオブジェクトに関連したチェーンを定義
    // 3. チェーンを実行
    
    // レイジーチェーンの生成を関数に格納しておくことにより、オブジェクトのデータ型に依らないように遅延実行する
    // オペレーションを汎用化できる
    function deferredSort(ary) {
		return lazyChain(ary).invoke("sort");
    }
    
    // 通常の関数呼び出しで、配列のソートを遅延実行する関数を生成できる
    var deferredSorts = _.map([[2,1,3],[7,7,1],[0,9,5]], deferredSort);
    
    // メソッド呼び出しをカプセル化
    function force(thunk) {
    	return thunk.force();
    }
    
    // 実行
    log("_.map(deferredSorts, force)", _.map(deferredSorts, force));
    // => [[1, 2, 3], [1, 7, 7], [0, 5, 9]]
    
    // メソッド呼び出しが関数型アプリケーションの世界まで引き上げられた
    
    // データ処理の骨子となる個別の機能を定義
    // データを検証する動作 [[ , , ], [ , , ], [ , , ]] 3つの要素を持った配列の配列をチェック
    var validateTriples = validator(
    	"それぞれの配列は３つの要素を持っている必要があります",
    	function(arrays) {
    		return _.every(arrays, function(a){
    			return a.length === 3;
    		});
    	}
    );
    
    var validateTripleStore = partial1(
    	condition1(validateTriples),          // condition(validators) => function(fun, arg) validatorsによってargを検証、通ればfun(arg)
    	_.identity                            // partial1 => fun <= _.identity
    );
    
    // 検証の動作をすべて１つの関数（あるいは、複数の関数）に集めておくことで、チェーン内の他のステップを気にすることなく
    // 検証内容を変更できる
    
    var result = validateTripleStore([[2,1,3],[7,7,1],[0,9,5]]);
    log("validateTripleStore", result);
    
    // validateTripleStore([[2,1,3],[7,7,1],[0,9,5,7,7,7,7,7,7]]);
    // => Error : それぞれの配列は３つの要素を持っている必要があります
    
    // そして、他の遅延実行処理の定義を行う（かならずしも遅延実行が必要ではないが）
    
    function postProcess(arrays) {
    	return _.map(arrays, second);
    }
    
    // ここまでに定義されたパーツを特定のタスクを行うために集めて、より高位のアクティビティを定義できる
    
    function processTriples(data) {
    	return pipeline(data
    			, JSON.parse
    			, partial(log, "after JSON parse")
    			, validateTripleStore
    			, partial(log, "after Validate")
    			, deferredSort                            // 一次配列に対するソートになっている
    			, partial(log, "after Sort")
    			, force
    			, partial(log, "after force")
    			, postProcess
    			, partial(log, "after reduce Second")
    			, invoker("sort", Array.prototype.sort)
    			, partial(log, "after Sort")
    			, str);
    }
    log("processTriples('[[7,7,1], [2,1,3], [0,9,5]]')", processTriples("[[7,7,1], [2,1,3], [0,9,5]]"));
    // => after JSON parse: [[7, 7, 1], [2, 1, 3], [0, 9, 5]]
    // => after Validate: [[7, 7, 1], [2, 1, 3], [0, 9, 5]]
    // => after Sort: {invoke: function(methodName /*, 任意の引数 */) {...  // thunk
    // => after force: [[0, 9, 5], [2, 1, 3], [7, 7, 1]]
    // => after reduce Second: [9, 1, 7]
    // => after Sort: [1, 7, 9]
    // => processTriples('[[7,7,1], [2,1,3], [0,9,5]]'): "1,7,9"
    
    var deferredSorts2 = curry2(_.map)(deferredSort);
	var force2 = curry2(_.map)(force);
	var result = force2(deferredSorts2([[7,7,1], [2,1,3], [0,9,5]]));
	log("Sorts2", result);
	
	function processTriples2(data) {
		return pipeline(data
				, JSON.parse
				, validateTripleStore
				, curry2(_.map)(deferredSort)      // 二次配列に対するソートに修正
				, curry2(_.map)(force)
				, postProcess
				, invoker("sort", Array.prototype.sort)
				, str);
    }
    log("processTriples2", processTriples2("[[7,7,1], [2,1,3], [0,9,5]]"));
    // => "2,5,7"
    
    // $.get("http://hogehoge.com", function(data){$('#result').text(processTriples2(data))});
    
    // レポーティングのためのロジックを抽象化する際に、この関数をロジックの一部として利用できる
    
    var reportDataPackets = _.compose(function(s) { $('#result').text(s)}, processTriples2);
    
    reportDataPackets("[[7,7,1], [2,1,3], [0,9,5]]");
    // => (html #result idのテキスト) 2,5,7
    
    // そして望んだ通りの効果を実行するために、抽象化されたロジックをアプリケーションに取り付けることができる
    
    // $.get("http://djhkjhkdj.com", reportDataPackets);
    
    // 互換性のあるパイプラインは最初から最後までつなげることができる
    // 互換性のないパイプラインもアダプタを介して入力と出力につなげることができる
    
    // パイプラインのように変換器にデータが流れていくという考え方は、単一の関数から大きなシステム全体
    // をカバーできるスケーラブルな考え方
    
    // しかし、オブジェクト指向の考え方が適切な場合がある
    // 汎用的な mixin を伴うデータ型が、正しく抽象化されている場合です
    
    //******************************************************************************************
	// p266 9.2 Mixin **************************************************************************
    
    // オブジェクトやメソッドがその場における最適なソリューションである場合がある
    
    // 「mixinベースの拡張」と呼ばれるアプローチの説明
    
    // 注 : 既存の動作に新しい動作を足す場合、クラスベースオブジェクト指向プログラミングが継承を利用するのとは対照的に
    //      mixinは継承を使用しないという制限のもと、関数合成によって似た状況を解決する
    
    // オブジェクトで考えることの必要性
    
    // オブジェクトを引数に取り、その内容を文字列に変換して返す関数polyToStringを構築することを想像する
    // 単純な実装
    function polyToString(obj) {
    	if(obj instanceof String)
    		return obj;
    	else if (obj instanceof Array)
    		return stringifArray(obj);
    	return obj.toString();
    }
    
    function stringifArray(ary) {
 	  return ["[", _.map(ary, polyToString).join(","), "]"].join('');
    }
    
    log("polyToString([1,2,3])", polyToString([1,2,3])); 
    // => "[1,2,3]"
    
    log("polyToString([1,2,[3,4]])", polyToString([1,2,[3,4]]));
    // =>  "[1,2,[3,4]]"
    
    // 別のデータ型に対応する文字列を生成しようとすると、そのたびにpolyToStringにif文を追加でネストする必要がある
    // dispatchを利用した解決
    var polyToString = dispatch(
    	function(s) { return _.isString(s) ? s : undefined },
    	function(s) { return _.isArray(s) ? stringifArray(s) : undefined },
    	function(s) { return s.toString(); }
    );
    
    log("polyToString(42)", polyToString(42)); // => "42"
    log("polyToString([1,2,[3,4]])", polyToString([1,2,[3,4]])); // => "[1,2,[3,4]]"
    log("polyToString('a')", polyToString('a')); // => "a"
    
    log("modified log", [1,2,"3",{a: [true, {b: null, d: undefined}]}]); // ディスパッチャーにより改修
    
    // データ型の階層が単一階層を超えてしまう場合には、必要以上に複雑になる可能性があります。
    // このような場合には、オブジェクトにカスタムtoStringメソッドを記述しておく方がより良い選択肢となります
    
    // しかしJavaScriptにおいて実現するにはポリシーに反した以下のようなことがよく行われている
    // ・コア言語のプロトタイプが変更される
    // ・クラス構造が作られる
    
    //******************************************************************************************
	// p270 9.2.1 コアプロトタイプマンジング
    
    // コアプロトタイプマンジング(Core Prototype Munging)
    
    // mung / munge : 一見なんということのない復元可能な変更を様々な場所に加えることにより、システム全体を
    // いつのまにか取り返しの付かない状態まで破壊してしまうような行為のこと
    
    // JavaScriptにおいて新しいデータ型を生成する際には、多くの場合、これらを構成しているものや拡張された部分を超えた
    // 特殊な動作が必要な場合があります
    
    // e.g.
    function Container(value) {
    	this._value = value;
    }
    console.log((new Container(42)).toString());
    // => [object Object]
    
    // 考察：JavaではすべてのルートオブジェクトObjectにtoStringメソッドが定義されている
    //       オーバーライドで実現できる
    
    // 解決の選択肢tとしてまずContainerに特化したtoStringメソッドをprototypeに定義する
    Container.prototype.toString = function() {
    	return ["@<", polyToString(this._value), ">"].join('');
    }
    console.log((new Container(42)).toString());
    // => @<42>
    
    // Container は記述者自身のコントロールに属すのでprototypeの内容を変更することは全く問題ない
    
    // しかし、コアオブジェクトに機能を追加したい場合はどうでしょう？
    // 唯一の選択肢はコアプロトタイプそのものに手を出すことです
    Array.prototype.toString = function() {
    	return "DONT DO THIS";
    }
    
    console.log([1,2,3].toString()); // => "DONT DO THIS"
    
    // ArrayやObjectなどのコアデータ型においては、そのようなカスタムの動作を、カスタムデータ型に委譲した関数に隔離しておくほうが
    // 遥かに良い
    // まさにContainer#toStringで行い、polyToStringに委譲した
    
    
    //******************************************************************************************
    // p270 9.2.2 クラス階層構造
    
    // Smalltalkでは、すべてがどこか別の場所で起こる  -----Adele Goldberg
    
    // Container型を階層的に実装した場合を思い浮かべる
    
    //               Container              
    //                  |                   
    //               Observed               
    //               Container              
    //                  |                   
    //                Hole                  
    //              -----------             
    //               setValue()             
    //                  |                   
    //       -------------------------      
    //       |                       |      
    //      CAS                  TableBase  
    //   ----------             ----------- 
    //     swap()                 insert()  
    //                                      
    // graph) 階層型で表現されたContainer型 
    
    // John Resigによって作られた小さなライブラリをもとに、余計なものを削ぎ落とした
    // JavaScriptのクラスライブラリをつくり、それを使って先ほどの階層がどのように構築できるか
    // をスケッチできます(Resig 2008)
    
    function ContainerClass() {}
    function ObservedContainerClass() {}
    function HoleClass() {}
    function CASClass() {}
    function TableBaseClass() {}
    
    
    ObservedContainerClass.prototype = new ContainerClass();
    HoleClass.prototype = new ObservedContainerClass();
    CASClass.prototype = new HoleClass();
    TableBaseClass.prototype = new HoleClass();
    
    log("(new CASClass()) instanceof HoleClass", (new CASClass()) instanceof HoleClass);
    // => true
    
    log("(new TableBaseClass()) instanceof HoleClass", (new TableBaseClass()) instanceof HoleClass);
    // => true
    
    log("(new HoleClass()) instanceof CASClass", (new HoleClass()) instanceof CASClass);
    // => false
    
    
    // スタブを入れてみる
    //var ContainerClass = Class.extend({
    //	init: function(val) {
    //		this._value = val;
    //	}
    //});
    
    // var c = new ContainerClass(42);
    // log("c", c); // => {_value: 42 ... }
    
    // c instanceof Class;
    // => true
    
    // ContainerClassはただ値を保持しています
    // しかし、observedContainerClassは追加機能を提供します
    
    // var ObsercedContainerClass = ContainerClass.extend(
    // 	observe: function(f) {note("observerを設定")},
    //	nitify: function() {note("obseverに通知")}
    // );
    
    // ObserverClassは自分自身で何かを行うことはないので、値を設定し、それを通知する方法が必要
    //var HoleClass = ObservedContainerClass.extend({
    //	init: function(val) {this.setValue(val)},
    //	setValue: function(val) {
    //		this._value = val;
    //		this.notify();
    //		return val;
    //	}
    //});
    
    // var h = new HoleClass(42);
    // // => 情報: observerに通知
    
    // h.observe(null);
    // 情報: observerを設定
    
    // h.setValue(108);
    // 情報: observerに通知
    // // => 108
    
    // そしてこの階層の一番底で新しいクラスと動作を加える
    //var CASCLASS = HoleClass.extend({
    //	swap: function(oldVal, newVal) {
    //		if(!_.isEqqual(oldVal, this._value)) fail("現在値が一致しません");
    //		return this.setValue(newVal);
    //	}
    //});
    
    // コンペア・アンド・スワップ(CAS)の仕組みを追加した
    
    // この仕組みは、「あなたが考えている現在値」と「新しい値」を提供すれば
    // その現在値が本当の現在値と同値である場合に限って、新しい値を代入する
    
    // 非同期プログラミングには有効
    // 現在値が変更されていないかどうかを確認するための手段を提供
    
    // JavaScriptの「Run-to-completion」とこの「Compare-and-swap」の組み合わせは
    // 非同期の値の変更における一貫性を確保するための強力な手段
    
    // Run-to-completion : JavaScriptのイベントループの性質をさしている
    // イベントループの特定のtickで実行されている呼び出しは、次のtickまでに完了されている
    // ことが保証されている
    // JavaScriptのイベントシステムの理解にはDavig Flagnanの「JavaScript 第６版」
    
    // var c = new CASClass(42);
    // // => 情報: observersに通知
    
    // c.swap(42, 43);
    // // => 情報: observersに通知
    // => 43
    
    // c.swap('not the value', 44);
    // Error: 現在値が一致しません
    
    // クラスベースの階層では小さい動作の実装を継承を使って組み立てることで
    // 大きな抽象を実現できる
    
    //******************************************************************************************
    // p276 9.2.3 階層を変更
    
    // しかしこの方法には潜在的な問題がある
    
    //               Container                
    //                  |                     
    //               Observed       Validated 
    //               Container      Conteiner 
    //                  |          -----------
    //                Hole          setCheck()
    //              -----------               
    //               setValue()               
    //                  |                     
    //       -------------------------        
    //       |                       |        
    //      CAS                  TableBase    
    //   ----------             -----------   
    //     swap()                 insert()    
    //                                        
    // graph) 階層を拡張                      
    
    // たとえば入力値の正常性を検証する関数を付与することができる
    // ValidatedContainer型を、この階層の真ん中に加えたい場合はどうか
    
    // 全てのHoleインスタンスに検証を許したいと思うことが考えられるが
    // 全ての場合に確実に検証が必要とは言えません
    
    // ここでのよりよい選択は必要な部分だけを拡張すること
    
    // たとえばCASクラスに検証が必要であればValidatedContainerを階層上においてそれを拡張する
    
    //                Hole                    
    //              -----------               
    //               setValue()               
    //                  |                     
    //      --------------------------        
    //      |                        |        
    //   Validated                TableBase   
    //   Conteiner               -----------  
    //  -----------                insert()   
    //   setCheck()                           
    //       |                                
    //      CAS                               
    //   ----------                           
    //     swap()                             
    //                                        
    // graph) 特別なケースを持つクラスを階層の下に押しやるのはトリッキー
    
    // しかし、もし新しい型が定義されてCASの仕組みが必要で、しかし検証は必要ない場合は
    // この階層構造に問題があるCASクラスを継承する別のクラスを作るべきでもない
    
    // クラス階層における大きな問題は、階層構造というものが、あらかじめ必要とされている動作を
    // 全て知っているという前提の上で作られているということです
    
    // オブジェクト指向のテクニックは動作の階層から始めて、決定されたものに対してクラスを当てはめる
    // と言うことが、暗に含まれている
    
    // しかしValidateContainer関数が示すほうに、その存在を分類することが困難な動作もそんざいする
    // そういう動作はただの動作である
    
    //******************************************************************************************
    // p276 9.2.4 Mixinを使って階層を平坦化
    
    // ここで問題をシンプルにしてみる
    
    // container    Ovserved     Validated        Hole       
    // ---------    Container    Container     -----------   
    //             -----------  -----------     setValue()   
    //              observe()    setCheck()                  
    //               notify()                                
    //                                                       
    // graph) 階層を平坦化(それぞれの箱はmixinと呼ばれるもの)
    
    // それぞれのクラスの基本の機能性がすべて同じレベルに置かれているところを想像
    
    // 階層を平坦化すると、そこにあるものはそれぞれのクラス間の暗黙的な関連性ではなくなり
    // 図中の箱はデータ型を定義しているとは必ずしも言えない状態になった
    
    // 代わりに図中のそれぞれの箱が表しているのは個別の動作の集合
    
    // 新しい動作を作る方法は新たに動作を定義するか、既存の動作を「混ぜ込む」ことになる
    
    // 注 : 本章でのmixinは、一般的に「プロトコル」として知れれるものと、テンプレートメソッドデザインパターン
    //      を足して、階層を引いたもの
    
    // 既存の関数を合成して新しい関数を生成するという考えに立ち戻る
    
    // Containerの実装をやり直す
    
    function Container(val) {
    	this._value = val;
    	this.init(val);
    }
    
    Container.prototype.init = _.identity;
    
    // このinit呼び出しの存在がmixinの特徴である
    // 関数のユーザがContainerを扱うインターフェイスとは別に、initで拡張可能なポイントを提供する
    
    // Containerの拡張プロトコルは具体的に次のようになります
    
    // 拡張プロトコル(mixin拡張の際の必須メソッド・プロパティ)
    //
    //    init
    //
    // インターフェイスプロトコル
    //
    //    コンストラクタ
    //
    
    // var c = new Container(42);
    // log("c", c);
    
    
    
    
    
    
    
});