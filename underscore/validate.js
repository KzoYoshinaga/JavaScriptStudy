// �^����ꂽ�֐��ɍŏ��̈����𕔕��K�p
function partial1(fun, arg) {
	return function(/* �P�ȏ�̈��� */) {
		var args = construct(arg1, arguments);
		return fun.apply(fun, args);
	};
} 

// �}�b�v�ϊ���K�p���Ĕz�񌋍�
function mapcat(fun, coll) {
	return cat.apply(null, _.map(coll,fun));
}

// ���؊֐����쐬���邽�߂́A�ЂƖڂł킩��悤��API��񋟂���
function validator(message, fun) {
	var f = function(/* args */) {
		return fun.apply(fun, arguments);
	};
	f['message'] = message;
	return f;
};

// ���؋@�\���A�v���C�֐�
function condition1(/* �P�ȏ�̌��؊֐� */) {
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

