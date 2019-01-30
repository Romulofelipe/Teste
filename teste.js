/**
* RFPRSlider
*
* @version 1.0
* @author Rômulo Felipe
* @license The MIT License (MIT)
*/
const VERSION = '1.0';
const AUTHOR = 'Romulo Reis';
const LICENSE = 'The MIT License (MIT)';
(function(){
	
    this.RFPRSlider = function RFPRSlider(){
        _init.call(this);
    };
    var _proto = RFPRSlider.prototype;
    var _isOnMouseTouch = false;
    _proto.next = function(){
        var next_slide = this.active_slide === (this.slides.length - 1) ? 0 : this.active_slide + 1;
        _changeSlide.call(this, next_slide);
        _restartPrevNext.call(this);
    };
    _proto.prev = function(){
        var prev_slide = this.active_slide === 0 ? (this.slides.length - 1) : this.active_slide - 1;
        _changeSlide.call(this, prev_slide);
        _restartPrevNext.call(this);
    };
    _proto.play = function(){
        this.options.autoplay = true;
        _changeSlide.call(this, this.active_slide);
        _slideIntervalHandler.call(this);
    };
    _proto.stop = function(){
        clearInterval(this.auto_transition);
        clearInterval(this.counter_interval);
        this.options.autoplay = false;
        this.auto_transition = null;
    };
    _proto.addEventListener = function(event, handler){
        if(this.eventListeners.hasOwnProperty(event)) this.eventListeners[event].push(handler);
        else this.eventListeners[event] = new Array(handler);
    };
    _proto.removeEventListener = function(event, handler){
        if(!this.eventListeners.hasOwnProperty(event)) return;
        var index = this.eventListeners[event].indexOf(handler);
        if(index !== -1){
            this.eventListeners[event].splice(index, 1);
        }
    };
    function _init(){
        var default_options = {
            selector: '.rfprslider',
            speed: 5000,
            animation: true,
            autoplay: false,
            counterSelector: false,
            reverse: false
        };
        this.eventListeners = {};
        this.options = _mergeOptions.call(this, default_options, RFPRSlider.arguments[0]);
        this.selector = typeof this.options.selector === 'string' ? document.querySelector(this.options.selector) : this.options.selector;
        if(this.selector === null) throw new Error('Selector does not exist');
        this.slides = _getSlideElements.call(this);
        this.active_slide = 0;
        _addCounter.call(this);
        _prepareSlideElements.call(this);
        if(this.options.autoplay) this.play.bind(this)();
    }
    function _restartPrevNext(){
        if(this.options.autoplay){
            this.stop.bind(this)();
            this.play.bind(this)();
        }
    }
    function _getSlideElements(){
        return this.selector.getElementsByClassName('slide');
    }
    function _prepareSlideElements(){
        if(!this.options.reverse) _buildSlideXR.call(this);
        else _buildSlideXL.call(this);
        window._slides = document.querySelector('.slides');
        _mousedownTouchstart.call(this);
        _changeSlide.call(this, this.active_slide);
    }
    function _mousedownTouchstart(){
        var cordX = 0, _ = this;
        var handlerMousedown = function(event, target){
            _.stop.bind(_)();
            _isOnMouseTouch = true;
			document.body.style.cursor = 'grab';
            window.mouseTouchX = event.pageX || event.touches[0].pageX;
            document.addEventListener(target, handlerMousemove);
        };
        var handlerMousemove = function(event){
            var mouseX = event.pageX || event.touches[0].pageX;
            cordX = (window.mouseTouchX - mouseX) / window.innerWidth * 70;
            if(cordX > 0 && _.active_slide === (_.slides.length - 1)) cordX /= 2;
            if(cordX < 0 && !_.active_slide) cordX /= 2;
            _slides.style.transform = 'translate3d('+((-_.active_slide * 100) - cordX)+'%, 0, 0)';
        };
        var handlerMouseupTouchend = function(){
            if(cordX >= 12 && _.active_slide !== _.slides.length - 1) _.next.bind(_)();
            else if(cordX <= -12 && _.active_slide !== 0) _.prev.bind(_)();
            else _changeSlide.call(_, _.active_slide);
            _isOnMouseTouch = false;
			document.body.style.cursor = '';
            _.play.bind(_)();
        }
        _slides.addEventListener('mousedown', function(event){
            handlerMousedown(event, 'mousemove');
        });
        _slides.addEventListener('touchstart', function(event){
            handlerMousedown(event, 'touchmove');
        });
        document.addEventListener('mouseup', function(event){
            document.removeEventListener('mousemove', handlerMousemove);
            handlerMouseupTouchend();
        });
        document.addEventListener('touchend', function(event){
            document.removeEventListener('touchmove', handlerMousemove);
            handlerMouseupTouchend();
        });
    }
    function _buildSlideXR(){
        for(var i = 0; i < this.slides.length; i++){
            this.slides[i].setAttribute('data-state', '');
            this.slides[i].setAttribute('data-slide', i);
            this.slides[i].style.left = (i * 100) + '%';
        }
    }
    function _buildSlideXL(){
        for(var i = 0, j = this.slides.length - 1; i < this.slides.length; i++){
            this.slides[j-i].setAttribute('data-state', '');
            this.slides[j-i].setAttribute('data-slide', i);
            this.slides[j-i].style.left = (i * 100) + '%';
        }
    }
    function _changeSlide(slide){
        var _ = this;
        _fireListener.call(this, 'before');
        for(var i = 0; i < this.slides.length; i++){
            this.slides[i].setAttribute('data-state', '');
        }
        if(this.options.animation) _slides.className += ' animation';
        _slides.style.transform = 'translate3d('+(-slide * 100)+'%, 0, 0)';
        setTimeout(function(){
            _slides.classList.remove('animation');
            _fireListener.call(_, 'after');
            _fireCounter.call(_);
        }, 500);
        this.slides[slide].setAttribute('data-state', 'active');
        this.active_slide = slide;
    }
    function _mergeOptions(config, options){
        if(typeof options === 'string'){
            config['selector'] = options;
            return config;
        }
        for(var option in options){
            if(options.hasOwnProperty(option)){
                config[option] = options[option];
            }
        }
        return config;
    }
    function _fireListener(event){
        _execAllEventListener.call(this, 'rfprslider.slide.' + event, {});
    }
    function _execAllEventListener(event, values){
        if(!this.eventListeners.hasOwnProperty(event)) return;
        this.eventListeners[event].forEach(function(handler){
            handler.call(this, values);
        });
    }
    function _addCounter(){
        this.options.counterSelector = typeof this.options.counterSelector === 'string' ? (this.options.counterSelector.trim() === '' ? false : document.querySelector(this.options.counterSelector)) : this.options.counterSelector;
        if(this.options.counterSelector === null) throw new Error('Counter selector does not exist');
    }
    function _fireCounter(_ = this){
        if(!_.options.counterSelector || !_.options.autoplay) return;
        clearInterval(_.counter_interval);
        var auxCounter = _.options.speed / 1000;
        _.options.counterSelector.innerHTML = auxCounter;
        _.counter_interval = setInterval(function(){
            if(!_isOnMouseTouch) _.options.counterSelector.innerHTML = --auxCounter;
        }, 1000);
    }
    function _slideIntervalHandler(_ = this){
        clearInterval(_.auto_transition);
        _.auto_transition = setInterval(function(){
            if(_.options.reverse) _.prev.bind(_)();
            else _.next.bind(_)();
        }, _.options.speed);
    }
	
	console.log('%c           ', 'font-size:30px;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAjCAYAAAAT6wFbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAUdSURBVHhe7Zy9cuIwEICXPIudIsMTmCcwaVKlTWdKaNKlTEcDJXTXpkoTeAL8BBkKzLtwKyNjyRbS2pYjktE3ozmOM2stWq32x9zghIDH44g7/qfH4wRvgB6neAP0OMUb4A9zXI5gMBjkY7Q88nf7YTs534eNyZa/eWN4A/Q45U7cJdfHCKiblSavHKqdSZMxAcqmtq3fheMSRkpZOEZLaOvbxPn27SFvgbvDN3+lJYVZyL4U00IdgSav5PtQFUiVsYZxvlA6Q6TKouqHFIYXzvBTV0hnEOI1zY89eb7px1drQ/4tNDyC2UK18BYahvcBf9UWZog0b2jGpN8WJjrD60wA90P+EomeH/Gdv41ggBEsshOwurQ8MlhE/JIcXKQ5ZbmvyZPHKuaXK6HOCY3Q6G6667edjPFOJdEiI8hrRrwqZe2mf938SB4wgOnuBJn4ra4/LXmctqjm9N7SM1P128KnYH3J5pqBnOUxA9JvLg+DfAQH0zdI+GuM3KAWujlAnlMK+4y/bIFRv+MB3y1I4MkblxV+eRkmhIcOx117+tuAjeqEqkzcUgZejgaJGY5yzhgvS3LUcTrdACUP8Acx6RfcQ5kfUOPgvjjCcoSLqkqIeAbepIRTGP1YDHAvsMQM79XEsLcTlCfHyyxO/1R8ZWQD3M4FZaNneLyF+Pj4BR/lpOAh5C9bYNYvhlcpThx38jZd2E5CmBlS8XQWXjEoGWZ8oUkYgxk2pa60n8OIcmMOwQDPrrSUidnkv+lNlAfsbAq6fsH0n5zhcm/zo4aI3kVa32gB2SUDx5EtUAMieHS+iMZXlYVDTs7Gxtpmul7zNalXHZRJGcpnzwOSB2Z/GrJTI3nRAj9RRZQRnVCJOtnihF+LJEs9r4bzwaHXj6GTmZxMH8cFvVwfKZQz/fsmEe6n/P7OSNfhUOklXqO614VNUspS3bO2HubvoYAeAyab61bclnQP+sSVxx/My4ijGvvg3DrPi6wfL7MoPQ3vzvTmEcVSkP4kYvVENDANoqwE3nQ1x/i19PzGNWOeb4UBCw23WXD0gHlsN/JisIuCWzCFXX60bITyDSc/mu12jHKkRGkInZpIoqzkyWAwYofGUAFoGAoJBlg/s6vn/6BRc7MurzZ27WPJogtB7xbY1q8ghlUuT9FRebHsCbO9EPN23LyiLKZ79ZSpjDLu7FZvraL1gMF0ByxQuEAIQu1y3YhttKns6qfoqKAn7K1aM7xvvXlvCfMRHK+kWGL97qb00BuW9WNGLclTFb9s8H1wtA7dyl1VSDFg/CoE3H3uakfY1i/sqz0TPpTztAlPwGhjBzafkaAlIRhwv/3ErnaFZf2yvZSj20PsxqQf8NXFBYrG7MybUg0QiZ+kc8p+hucYk355n5RSXjku4V0oFCdWn1oQe9/6diCbr7YhETzCcyHL4alGNkCpFoTKf3TafjcIRb+8vMKyQnVjPe+pSjVK20/NBPB4sRpElbnzBwO0xpeDSZPg9tdj/QYr+sW2fyZAN8CK8ulsrlyE30sT/YqfA8hD7qk2K8hSqbUDqyUUYQMkieDVVVQSsHKD1UehW2qzBoM0MECmvPjMnPrpht+MTr941eRJZ2Z8doP1ElbuURS/K7AHZldP/C8azB0TmchmCow0MkCcLkih0l+zQK1+5ZPO1xcsgU0PmWKdc/FbqjkWtGiZnn8GYNhgXK7tnwn4/5zI45SGHtDjsYs3QI9TvAF6nOIN0OMUb4AehwD8Bw3toleUuYACAAAAAElFTkSuQmCC) no-repeat;');
	console.log('AUTHOR:  ' + AUTHOR);
	console.log('VERSION: ' + VERSION);
	console.log('LICENSE: ' + LICENSE);
}());
