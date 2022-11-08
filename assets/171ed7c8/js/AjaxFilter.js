/**
 * 在不改变ajax原因参数格式的前提下，定义一个ajax过滤器
 * 规定所有的ajax请求，数据类型必须是json格式，且返回值必须包含一个命名为success的bool值
 * @author wudx
 */
 if ("undefined" == typeof(console.log)){
	console.log = function(){return;};
}
jQuery.ajaxOld = jQuery.ajax;
jQuery.ajax = function( url, options ){
	if ( typeof url === "object" ) {
		options = url;
		url = undefined;
	}
	
	//规定Ajax 数据格式必须使用 json 格式
	if (options.dataType != 'json'){
		console.log('*** WARNING: ajax dataType must json ***');
		//return false;
	}
	var oldSuccess = options.success;
	//定义一个拦截器，拦截格式不规范的返回值
	function successFilter(rs){
		if ('string'==typeof(rs) && rs.indexOf('_SESSION_INVALID') > 0 ){
			if (!window.top.sessionInvalid){
				window.top.sessionInvalid = true;
				alert("登录信息失效，请重新登录.");
			}
			window.top.location = "/";
			return;
		}

		//规定 Ajax 返回值必须包含一个状态值success
		var $msg = '';
		if (typeof(rs) == 'object' && typeof(rs.success) == 'boolean'){
			if (rs.message == 'YUNXI_SESSION_INVALID' || rs.message == 'YUNXI_SESSION_OUT'){
				if (rs.message == 'YUNXI_SESSION_INVALID'){
					$msg =  "登录信息失效，请重新登录。";
				}else{
					$msg =  "您的账号已在其他设备登录，被迫下线，若非本人操作请及时修改密码。";
				}
				if (!window.top.sessionInvalid){
					window.top.sessionInvalid = true;
					alert($msg);
				}
				window.top.location = "/";
                return;
			}
			if (typeof(oldSuccess) === 'function'){
                oldSuccess(rs);
			}
		}else{
			//console.log('*** WARNING ajax responses data must json and has bool success ***');
			if(typeof(oldSuccess) === 'function'){
                oldSuccess(rs);
            }
		}
	}

	/*options.beforeSend = function () {
        $.messageBox.loading();
    }
    options.complete = function () {
        $.messageBox.loadEnding();
    }*/
    options.success = successFilter;
	return jQuery.ajaxOld(options);
};

/**
 * 使用新的ajax方法，重构$.get和$.post方法
 * @author wudx
 */
jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});