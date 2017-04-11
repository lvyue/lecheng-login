"use static";
/* jshint esversion: 6 */
let version = "00.000.002";
let Login = window.Login || {};
if (version !== Login.version) {
    Login.version = version;
    let props = {
        "server": "http://www.lechenggu.com",
        "selector": ".user-auth",
        "callback": function () {
            window.location.reload();
        }
    };

    let __login_html = '<div class="lecheng-common-login-box" style="display:none;"><div>' +
        '<h3><a class="tab active" data-for="qrcode-area" href="javascript:;">微信扫码登录</a><a class="tab" data-for="phone-login-area" href="javascript:;">手机号登录</a><a href="javascript:;" class="close">×</a></h3>' +
        '<div class="qrcode-area login-action" style="display: block;"><div class="qrcode-wrap">' +
        '<div><div class="title">微信登录</div><div class="content">' +
        '<div class="qrcode-content"><img class="qrcode" src="http://www.lechenggu.com/apis/login-qrcode.png"></div>' +
        '<div class="info"><div class="status_browser"><p>请使用微信扫描二维码登录</p><p>“乐橙谷”</p>' +
        '</div></div></div></div></div>' +
        '<div class="qrcode-wrap"><div><div class="title">微信注册</div>' +
        '<div class="content"><div class="qrcode-content"><img class="qrcode" src="http://www.lechenggu.com/bbs/images/wechat-fw-qrcode.jpg"></div>' +
        '<div class="info"><div class="status_browser"><p>请使用微信扫描二维码关注</p><p>“乐橙谷”</p>' +
        '</div></div></div></div></div></div>' +
        '<div class="phone-login-area login-action" style="display: none;">' +
        '<div><label for="user-login-phone">手机号：</label>' +
        '<input type="text" name="phone" id="user-login-phone" placeholder="请输入您的手机号">' +
        '</div>' +
        '<div><label for="user-login-checkcode">验证码：</label>' +
        '<input type="text" name="checkcode" id="user-login-checkcode" class="checkcode" placeholder="请输入验证码"><a class="send-checkcode send-checkcode-btn btn" href="javascript:;">发送验证码</a></div>' +
        '<div class="clear"><a id="box-user-phone-register-btn" class="box-user-register-btn btn" href="javascript:;">手机号注册</a><a id="box-user-phone-login-btn" class="box-user-login-btn btn" href="javascript:;">手机号登录</a></div>' +
        '</div></div></div>';
    Login.config = function () {
        let args = arguments;
        let flag = 0;
        if (args.length > 0) {
            if (args.length === 1) {
                if (Object.prototype.toString.call(args[0]) === "[object Object]") { // 属性配置
                    let opts = args[0];
                    ["server", "selector"].forEach((p, i) => {
                        let t = opts[p];
                        if (t && Object.prototype.toString.call(t) === "[object String]") {
                            props[p] = t;
                            flag = i;
                        }
                    });
                    if (opts.callback && Object.prototype.toString.call(opts.callback) === "[object Function]")
                        props.callback = opts.callback;
                }
            } else if (args.length >= 2) {
                let [key, val] = args;
                let index = ["server", "selector", "callback"].indexOf(key);
                if (index === 0 || index === 1)
                    if (val && Object.prototype.toString.call(val) === "[object String]") {
                        props[key] = val;
                        flag = index;
                    }
                if (index === 2)
                    if (val && Object.prototype.toString.call(val) === "[object Function]")
                        props[key] = val;
            }
        }
        if (flag === 1) // 重新配置 调用初始化
            Login._init();
    };

    Login._init = function () { // 初始化
        let $box = $('.lecheng-common-login-box');
        if ($box.length === 0) {
            $('body').append(__login_html);
            $box = $('.lecheng-common-login-box');
            let _timer_func = function () {
                var __$sendCodeBtn = $('.send-checkcode-btn'),
                    __second = parseInt(__$sendCodeBtn.attr('data-second') || '0');
                if (__second === 0) {
                    $box.on('click', '.send-checkcode-btn', _send_code_func); // 
                    __$sendCodeBtn.text('重新发送');
                    return;
                } else {
                    __$sendCodeBtn.text('重新发送（' + __second + 's）');
                    __$sendCodeBtn.attr('data-second', --__second);
                    setTimeout(_timer_func, 1000);
                }
            };
            let _send_code_func = function () {
                $box.off('click', '.send-checkcode-btn', _send_code_func); // 取消事件
                var _$this = $(this),
                    _$phone = $('#user-login-phone'),
                    _phone = _$phone.val();
                if (/^[1][345789][0-9]{9}$/.test(_phone)) { // 验证通过，发送验证码
                    _$this.text('正在发送……');
                    $.ajax({
                        "url": `${props.server}/apis/smsLogin`,
                        "type": "GET",
                        "dataType": "JSON",
                        "cache": "false",
                        "data": {
                            phone: _phone
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true,
                        "success": function (res) { // 2 0
                            var _code = res.code;
                            if (_code == 32) { // 未绑定账户
                                _$this.text('发送验证码');
                                alert('您的手机号尚未绑定平台账户，请先微信扫码登录系统，绑定手机号');
                                $box.find('h3 .tab[data-for="qrcode-area"]').trigger('click');
                                $box.on('click', '.send-checkcode-btn', _send_code_func);
                            } else if (_code == 2) {
                                _$this.text('发送验证码');
                                alert('系统繁忙，请稍后再试！');
                                $box.on('click', '.send-checkcode-btn', _send_code_func);
                            } else {
                                _$this.text('重新发送（60s）');
                                _$this.attr('data-second', 59);
                                $('#box-user-phone-login-btn').attr('data-phone', _phone);
                                $('#box-user-phone-login-btn').attr('data-send', true);
                                setTimeout(_timer_func, 1000);
                            }
                        },
                        "error": function (res) {
                            alert("请检查您的网络");
                            $box.on('click', '.send-checkcode-btn', _send_code_func); // 取消事件
                            _$this.text('发送验证码');
                        }
                    });
                } else { // 验证失败，请输入正确的手机号
                    alert("请输入正确的手机号");
                    _$phone[0].focus();
                    $box.on('click', '.send-checkcode-btn', _send_code_func);
                    return;
                }
            };
            let _user_login_func = function () {
                $box.off('click', '.box-user-login-btn', _user_login_func); // 取消事件
                var _$this = $(this),
                    _hasSendCode = (_$this.attr('data-send') || 'false').toLowerCase() === "true",
                    _$phone = $('#user-login-phone'),
                    _phone = _$phone.val(),
                    _$checkcode = $('#user-login-checkcode'),
                    _checkcode = _$checkcode.val();
                if (/^[1][345789][0-9]{9}$/.test(_phone) && /^[0-9]{6}$/.test(_checkcode) && _hasSendCode) { // 验证通过，用户登录
                    $.ajax({
                        "url": `${props.server}/apis/loginByPhoneCode`,
                        "type": "GET",
                        "dataType": "JSON",
                        "cache": "false",
                        "data": {
                            phone: _phone,
                            phoneCode: _checkcode
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true,
                        "success": function (res) { // 2370
                            var _code = res.code;
                            if (_code === 0) {
                                clearInterval(Login.check_interval);
                                delete Login.check_interval;
                                props.callback(res.result);
                            } else {
                                alert('登录失败，请稍后再试');
                                $box.on('click', '.box-user-login-btn', _user_login_func);
                            }
                        }
                    });
                } else { // 验证失败，请输入正确的手机号
                    alert("请输入正确的手机号与验证码进行登录");
                    $box.on('click', '.box-user-login-btn', _user_login_func);
                    return;
                }
            };
            $box.off('click', 'h3 a.close').on('click', 'h3 a.close', function () {
                $('body').attr('class', '');
                $box.hide();
                $box.find('h3 .tab[data-for="qrcode-area"]').trigger('click');
                $('#user-login-phone').val('');
                $('#user-login-checkcode').val('');
                clearInterval(Login.check_interval);
                delete Login.check_interval;
            });
            $box.off('click', 'h3 .tab').on('click', 'h3 .tab', function () {
                var _$this = $(this),
                    _$parent = _$this.parent(),
                    _$loginBox = _$parent.parent(),
                    _action = _$this.attr('data-for');
                _$parent.find('.tab').removeClass('active');
                _$this.addClass('active');
                _$loginBox.find('.login-action').hide();
                _$loginBox.find('.' + _action).show();
            });
            $box.off('input', 'input[name="phone"]').on('input', 'input[name="phone"]', function () {
                var _$this = $(this),
                    _phone = _$this.val(),
                    _parsePhone = _phone.replace(/[^\d]/gi, '');
                _parsePhone = _parsePhone.length > 11 ? _parsePhone.substring(0, 11) : _parsePhone;
                _$this.val(_parsePhone);
                $('#box-user-phone-login-btn').removeAttr('data-phone');
                $('#box-user-phone-login-btn').removeAttr('data-send');
            });
            $box.off('input', 'input[name="checkcode"]').on('input', 'input[name="checkcode"]', function () {
                var _$this = $(this),
                    _checkcode = _$this.val(),
                    _parsePhone = _checkcode.replace(/[^\d]/gi, '');
                _parsePhone = _parsePhone.length > 6 ? _parsePhone.substring(0, 6) : _parsePhone;
                _$this.val(_parsePhone);
            });

            $box.off('click', '.send-checkcode-btn').on('click', '.send-checkcode-btn', _send_code_func);
            $box.off('click', '.box-user-login-btn').on('click', '.box-user-login-btn', _user_login_func);
            $box.off('click', '.box-user-register-btn').on('click', '.box-user-register-btn', function () {
                window.location.href = `${props.server}/register.html`;
            });
        }
        $(document).off('click', props.selector).on('click', props.selector, function () {
            $('body').addClass('fixed');
            $box.show();
            Login.check_interval = setInterval(function () {
                $.ajax({
                    "url": `${props.server}/apis/session`, //http://www.lechenggu.com/apis/session
                    cache: false,
                    type: "get",
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    success: function (result) {
                        var user = result.result;
                        if (user && user._id) {
                            clearInterval(Login.check_interval);
                            delete Login.check_interval;
                            props.callback(user);
                        }
                    }
                });
            }, 3000);
        });
    };
    window.Login = Login;
}
Login._init(); // 调用初始化