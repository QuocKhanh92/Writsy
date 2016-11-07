/*global Math, _, document, jQuery, window, mejs, Hammer*/
(function (window, $) {
    'use strict';

    var w = {};

    w.params = window.writsy_params || {};

    w.breakpoints = {
        'xsmall': 0,
        'small': 600,
        'medium': 960,
        'large': 1280,
        'xlarge': 1600
    };

    w.setup = function () {
        if (document.documentElement.classList) {
            document.documentElement.classList.add('js');
            document.documentElement.classList.remove('no-js');
        } else {
            document.documentElement.className += ' js';
            document.documentElement.className.replace(/\bno-js/g, '');
        }

        window.HTMLElement.prototype.wrap = function (wrapper) {
            this.parentNode.insertBefore(wrapper, this);
            wrapper.appendChild(this);
        };

        window.lazySizesConfig = window.lazySizesConfig || {};

        window.lazySizesConfig.preloadAfterLoad = true;

        if (!window.HTMLPictureElement || !document.createElement('img').hasOwnProperty('sizes')) {
            this.loadJS(this.params.path + '/assets/vendor/lazysizes/plugins/respimg/ls.respimg.min.js');
        }

        this.loadJS(this.params.path + '/assets/vendor/lazysizes/plugins/bgset/ls.bgset.min.js');
        this.loadJS(this.params.path + '/assets/vendor/lazysizes/plugins/print/ls.print.min.js');
    };

    w.loadJS = function (src) {
        var r = document.querySelector('script[src^="' + w.params.path + '/assets/js/writsy.js"]'),
            s = document.createElement('script');

        s.src = src;
        s.attributes.type = 'text/javascript';
        r.parentNode.insertBefore(s, r);
    };

    w.hasClass = function (el, name) {
        if (el.classList) {
            return el.classList.contains(name);
        } else {
            var classes = el.className.split(' ');

            return classes.indexOf(name);
        }
    };

    w.addClass = function (el, name) {
        if (el.classList) {
            el.classList.add(name);
        } else {
            var classes = el.className.split(' ');

            if (!el.hasClass(name)) {
                classes.push(name);
            }

            el.className = classes.join(' ');
        }
    };

    w.removeClass = function (el, name) {
        if (el.classList) {
            el.classList.remove(name);
        } else {
            var classes = el.className.split(' '),
                index = classes.indexOf(name);

            if (index > 0) {
                classes.splice(index, 1);
            }

            el.className = classes.join(' ');
        }
    };

    w.registerEvent = function (el, key, callback) {
        if (el.addEventListener) {
            el.addEventListener(key, callback);
        } else if (el.attachEvent) {
            el.attachEvent('on' + key, callback);
        }
    };

    w.removeEvent = function (el, key, callback) {
        if (el.removeEventListener) {
            el.removeEventListener(key, callback);
        } else if (el.attachEvent) {
            el.detachEvent('on' + key, callback);
        }
    };

    w.intrinsicRatio = function () {
        var o = {
            el: document.querySelectorAll('iframe')
        };

        o.init = function () {
            _.each(this.el, function (el) {
                if (w.hasClass(el, 'no-ratio')) {
                    return;
                }

                if (!el.hasAttribute('width') && !el.hasAttribute('width')) {
                    return;
                }

                var wr = document.createElement('span'),
                    hl = document.createElement('span'),
                    ow = el.getAttribute('width'),
                    oh = el.getAttribute('height');

                if (ow <= 0 || oh <= 0) {
                    return;
                }

                wr.className = 'intrinsic-ratio-box';
                hl.className = 'intrinsic-ratio-helper';
                hl.style.paddingBottom = (oh / ow) * 100 + '%';

                el.wrap(wr);

                wr.appendChild(hl);
            });
        };

        return o.init();
    };

    w.dialog = function (el) {
        var o = {
            el: document.querySelectorAll(el),
            current: null
        };

        o.open = function (e) {
            if (this.getAttribute('href')) {
                o.current = this.getAttribute('href').replace('#', '');
            }

            if (!o.current) {
                return;
            }

            o.show(document.getElementById(o.current));

            e.preventDefault();
        };

        o.close = function (e) {
            if (!o.current) {
                return;
            }

            o.hide(document.getElementById(o.current));

            e.preventDefault();
        };

        o.keydown = function (e) {
            var key = e.keyCode;

            if (!key) {
                key = e.which;
            }

            if (o.current && (/(38|40|27)/).test(key)) {
                o.hide(document.getElementById(o.current));
            }
        };

        o.show = function (dialog) {
            var overlay = dialog.querySelector('.dialog-overlay'),
                closeButton = dialog.querySelector('.dialog-close'),
                scrollBar = o.getScrollBarWidth(),
                hammer = new Hammer(dialog);

            if (overlay) {
                w.registerEvent(overlay, 'click', o.close);
            }

            if (closeButton) {
                w.registerEvent(closeButton, 'click', o.close);
            }

            w.registerEvent(document, 'keydown', o.keydown);

            w.addClass(dialog, 'dialog-is-active');

            w.addClass(document.body, 'has-active-dialog');

            hammer.on('panleft', function () {
                o.hide(dialog);
            });

            if (scrollBar >= 1) {
                document.body.style.paddingRight = scrollBar + 'px';
            }
        };

        o.hide = function (dialog) {
            var overlay = dialog.querySelector('.dialog-overlay'),
                closeButton = dialog.querySelector('.dialog-close');

            if (overlay) {
                w.removeEvent(overlay, 'click', o.close);
            }

            if (closeButton) {
                w.removeEvent(closeButton, 'click', o.close);
            }

            w.removeEvent(document, 'keydown', o.keydown);

            w.removeClass(dialog, 'dialog-is-active');

            w.removeClass(document.body, 'has-active-dialog');

            document.body.style.paddingRight = '';
        };

        o.updatePosition = function (el) {
            if (el) {
                var dialog = document.getElementById(el.replace('#', '')),
                    inner = dialog.querySelector('.dialog-inner'),
                    update = _.debounce(function () {
                        inner.style.marginTop = Math.round(inner.clientHeight / 2) * -1 + 'px';
                    });

                if (!w.hasClass(dialog, 'dialog-fullscreen')) {
                    update();

                    w.registerEvent(window, 'resize', update);
                }
            }
        };

        o.getScrollBarWidth = function () {
            var v, d = document.createElement('div');

            d.className = 'scrollbar-measure';

            document.body.appendChild(d);

            v = d.offsetWidth - d.clientWidth;

            document.body.removeChild(d);

            return v;
        };

        o.init = function () {
            _.each(this.el, function (el) {
                o.updatePosition(el.getAttribute('href'));

                w.registerEvent(el, 'click', o.open);
            });
        };

        return o.init();
    };

    w.sidenav = function (el) {
        var o = {
            el: document.querySelectorAll(el)
        };

        o.click = function (e) {
            var subMenu = $(this).parent().children('.sub-menu'),
                subMenus = $(this).closest('ul').find('> li > .sub-menu').not(subMenu);

            subMenus.slideUp(300);

            subMenu.slideToggle(300);

            e.preventDefault();
        };

        o.init = function () {
            _.each(this.el, function (el) {
                var anchors = el.querySelectorAll('li.menu-item-has-children > a');

                _.each(anchors, function (a) {
                    w.registerEvent(a, 'click', o.click);
                });
            });
        };

        return o.init();
    };

    w.shareLinks = function () {
        _.each(document.querySelectorAll('.entry-share-links'), function (item) {
            if (!w.hasClass(item, 'entry-share-links-dropdown')) {
                var check = _.debounce(function () {
                    if (window.outerWidth < w.breakpoints.small - 1) {
                        w.addClass(item, 'entry-share-links-dropdown');
                    } else {
                        w.removeClass(item, 'entry-share-links-dropdown');
                    }
                });

                check();

                w.registerEvent(window, 'resize', check);
            }
        });
    };

    w.newsletterDialogInputs = function () {
        var dialog = document.getElementById('newsletter-subscription-dialog');

        if (!dialog) {
            return;
        }

        _.each(dialog.getElementsByTagName('input'), function (input) {
            if (input.getAttribute) {
                if (input.getAttribute('type') === 'submit') {
                    w.removeClass(input, 'button-block');
                    w.addClass(input, 'button-large');
                }

                if (input.getAttribute('type') === 'email') {
                    w.addClass(input, 'input');
                    w.addClass(input, 'input-large');
                }
            }
        });
    };

    w.audioPlayer = function () {
        var el = document.querySelectorAll('.audio-player');

        if (el.length < 1 || window.mejs === 'undefined') {
            return;
        }

        _.each(el, function (player) {
            var audio = player.querySelector('audio');

            $(audio).mediaelementplayer({
                features: ['current', 'duration', 'progress'],
                timeAndDurationSeparator: '<span>/</span>',
                success: function (mejs) {
                    var button = $(mejs).closest('.audio-player').find('.audio-player-button');

                    button.on('click', function () {
                        $(this).toggleClass('play');

                        if ($(this).hasClass('play')) {
                            mejs.pause();
                        } else {
                            mejs.play();
                        }
                    });

                    $(mejs).on('ended', function () {
                        button.addClass('play');
                    });
                }
            });
        });
    };

    w.toolbar = function () {
        var o = {
            el: document.querySelectorAll('.site-toolbar')
        };

        o.onScroll = _.throttle(function (toolbar) {
            if (window.scrollY >= toolbar.clientHeight) {
                w.addClass(toolbar, 'site-toolbar-shadow');
            } else {
                w.removeClass(toolbar, 'site-toolbar-shadow');
            }
        }, 100);

        o.init = function () {
            _.each(this.el, function (toolbar) {
                w.registerEvent(window, 'scroll', function () {
                    o.onScroll(toolbar);
                });
            });
        };

        return o.init();
    };

    w.imageSlider = function () {
        $('.image-slider').slick({
            infinite: false,
            nextArrow: '<span class="slick-next"><i class="wi wi-arrow-right"></i></span>',
            prevArrow: '<span class="slick-prev"><i class="wi wi-arrow-left"></i></span>',
            speed: 600
        });
    };

    w.featuredBoxed = function () {
        var element = $('.featured-boxed'),
            images = $('.featured-slider-images', element),
            content = $('.featured-slider-content', element);

        images.slick({
            arrows: false,
            asNavFor: content,
            speed: 600
        });

        content.slick({
            arrows: false,
            asNavFor: images,
            customPaging: function (ignore, index) {
                return '<span>' + (index + 1) + '</span>';
            },
            autoplay: true,
            autoplaySpeed: 5000,
            dots: true,
            dotsClass: 'slick-dots slick-pagination',
            fade: true,
            speed: 600
        });

        element.addClass('featured-area-active');
    };

    w.featuredCarousel = function () {
        var slider = $('.featured-carousel .featured-slider');

        if (slider.children().length > 2) {
            slider.slick({
                autoplay: true,
                autoplaySpeed: 5000,
                centerMode: true,
                centerPadding: 0,
                mobileFirst: true,
                nextArrow: '<span class="slick-wing slick-next"><span><i class="wi wi-arrow-right"></i></span></span>',
                prevArrow: '<span class="slick-wing slick-prev"><span><i class="wi wi-arrow-left"></i></span>',
                speed: 600,
                responsive: [
                    {
                        breakpoint: 1439,
                        settings: {
                            nextArrow: '<span class="slick-wing slick-next"><span>' + w.params.next_post + '<i class="wi wi-arrow-right"></i></span></span>',
                            prevArrow: '<span class="slick-wing slick-prev"><span><i class="wi wi-arrow-left"></i>' + w.params.prev_post + '</span>'
                        }
                    }
                ]
            });
        }

        slider.parent().addClass('featured-area-active');
    };

    w.featuredCarousel2 = function () {
        var slider = $('.featured-carousel2 .featured-slider');

        if (slider.children().length > 2) {
            slider.slick({
                arrows: false,
                autoplay: false,
                autoplaySpeed: 5000,
                centerMode: true,
                centerPadding: 0,
                mobileFirst: true,
                focusOnSelect: true,
                // infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 600,
                responsive: [
                    {
                        breakpoint: w.breakpoints.small,
                        settings: {
                            slidesToShow: 2
                        }
                    },
                    {
                        breakpoint: w.breakpoints.medium,
                        settings: {
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: w.breakpoints.xlarge,
                        settings: {
                            slidesToShow: 5,
                            centerMode: false
                        }
                    }
                ]
            });
        }

        slider.parent().addClass('featured-area-active');
    };

    w.featuredFullwidth = function () {
        var element = $('.featured-fullwidth'),
            content = $('.featured-slider-content', element),
            navigator = $('.featured-slider-nav', element);

        content.slick({
            arrows: false,
            asNavFor: navigator,
            autoplay: true,
            autoplaySpeed: 5000,
            infinite: true,
            speed: 600
        }).on('afterChange', function (ignore, slick) {
            navigator.find('.slick-slide[data-slick-index="' + slick.currentSlide + '"]').trigger('click');
        });

        navigator.slideDown(600, function () {
            navigator.slick({
                arrows: false,
                asNavFor: content,
                focusOnSelect: true,
                infinite: true,
                mobileFirst: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 600,
                responsive: [
                    {
                        breakpoint: w.breakpoints.small,
                        settings: {
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: w.breakpoints.large,
                        settings: {
                            slidesToShow: 5
                        }
                    }
                ]
            });
        });

        element.addClass('featured-area-active');
    };

    w.recommendedPosts = function () {
        $('.recommended-posts').find('.posts-list').slick({
            arrows: false,
            dots: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            speed: 600,
            responsive: [
                {
                    breakpoint: w.breakpoints.medium - 1,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                }
            ]
        });
    };

    w.relatedPosts = function () {
        $('.related-posts .posts-list').slick({
            appendArrows: $('.related-posts-header'),
            dots: false,
            infinite: false,
            mobileFirst: true,
            nextArrow: '<span class="slick-next"><i class="wi wi-arrow-right"></i></span>',
            prevArrow: '<span class="slick-prev"><i class="wi wi-arrow-left"></i></span>',
            slidesToShow: 2,
            slidesToScroll: 2,
            speed: 600,
            responsive: [
                {
                    breakpoint: w.breakpoints.small,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]
        });
    };

    w.tweets = function () {
        $('.tweets').slick({
            adaptiveHeight: true,
            arrows: false,
            dots: true,
            infinite: false,
            fade: true,
            speed: 600
        });
    };

    w.footerInstagram = function () {
        $('.instagram-gallery .instagram-feeds').slick({
            arrows: false,
            infinite: true,
            mobileFirst: true,
            slidesToShow: 2,
            responsive: [
                {
                    breakpoint: w.breakpoints.small,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                },
                {
                    breakpoint: w.breakpoints.medium,
                    settings: {
                        slidesToShow: 6,
                        slidesToScroll: 6
                    }
                },
                {
                    breakpoint: 1920,
                    settings: {
                        slidesToShow: 8,
                        slidesToScroll: 8
                    }
                }
            ]
        });
    };

    w.lightbox = function () {
        $('.gallery-icon a, .lightbox').simpleLightbox({
            animationSpeed: 100,
            navText: ['<i class="wi wi-arrow-left"></i>', '<i class="wi wi-arrow-right"></i>'],
            closeText: '<i class="wi wi-times"></i>'
        });
    };

    w.toggleSearch = function () {
        var search = $('.sub-menu.search'),
            trigger = $('.search-trigger'),
            close = function (e) {
                if ($(e.target).parents('.search-trigger').length || $(e.target).is(trigger)) {
                    return;
                }

                if ($(e.target).parents('.sub-menu.search').length || $(e.target).is(search)) {
                    return;
                }

                search.hide();
            };

        trigger.on('click', function () {
            search.toggle(0, function () {
                if (search.is(':visible')) {
                    w.registerEvent(document, 'click', close);
                } else {
                    w.removeEvent(document, 'click', close);
                }
            });
        });
    };

    w.init = function () {
        w.setup();
        w.toolbar();
        w.shareLinks();
        w.newsletterDialogInputs();
        w.intrinsicRatio();

        $(function () {
            w.dialog('[data-toggle="dialog"]');
            w.sidenav('.sidenav');
            w.imageSlider();
            w.featuredBoxed();
            w.featuredCarousel();
            w.featuredCarousel2();
            w.featuredFullwidth();
            w.recommendedPosts();
            w.relatedPosts();
            w.tweets();
            w.footerInstagram();
            w.lightbox();
            w.audioPlayer();
            w.toggleSearch();
            w.registerEvent(window, 'load', $.fn.matchHeight._update);
            w.registerEvent(window, 'resize', $.fn.matchHeight._update);
        });
    };

    window.writsy = w || {};

    return w.init();

}(window, jQuery));