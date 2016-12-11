$(function(){
	// p189 ７章 再帰
	
	// 完全に関数型かつ実用的なスタイルを求めるための要点を説明する
	// 関数を使って構築すること、だけではなく
	// 関数型プログラミングは、ソフトウェアの創造プロセスにまとわりつく複雑さを最小限に抑えるための構築方法を考える手段
	// 複雑さを抑える方法のひとつはプログラム内の状態変更を最小限に抑える、
	// もしくは(理想的には)完全に排除すること
	
	
	//******************************************************************************************
	// p189 7.1 純粋性 *************************************************************************
	
	// ある数値を与えられると１からその数値までの間から(擬似)ランダムに選んだ数値を返すような関数を考える
	var rand = partial1(_.random, 1);
	
	log("rand(10)", rand(10));
	
	

});