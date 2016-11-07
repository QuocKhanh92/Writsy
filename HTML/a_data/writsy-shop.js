/*global document, jQuery, window, wc_add_to_cart_params, writsy*/
(function (window, $) {
    'use strict';

    var ws = {};

    ws.params = window.writsy_params || {};

    ws.productPreview = function () {
        var images = $('.product-images'),
            thumbs = $('.product-thumbnails');

        images.slick({
            asNavFor: thumbs,
            infinite: false,
            nextArrow: '<span class="slick-next"><i class="wi wi-arrow-right"></i></span>',
            prevArrow: '<span class="slick-prev"><i class="wi wi-arrow-left"></i></span>',
            speed: 600
        });

        thumbs.slick({
            asNavFor: images,
            focusOnSelect: true,
            infinite: false,
            nextArrow: '<span class="slick-next"><i class="wi wi-arrow-right"></i></span>',
            prevArrow: '<span class="slick-prev"><i class="wi wi-arrow-left"></i></span>',
            speed: 600,
            slidesToShow: 7
        });
    };

    ws.zoom = function () {
        $('.zoom').each(function () {
            $(this).zoom({
                url: $(this).data('src')
            });
        });
    };

    ws.init = function () {
        $(function () {
            ws.productPreview();
            ws.zoom();

            $('body').on('added_to_cart', function (event, fragments, cart_hash, button) {
                button.attr('href', wc_add_to_cart_params.cart_url);
                button.html('<i class="fa fa-shopping-cart"></i> ' + wc_add_to_cart_params.i18n_view_cart);
                button.removeClass('ajax_add_to_cart');
            });

            if (document.body.clientWidth < writsy.breakpoints.medium) {
                var tabs = $('.woocommerce-MyAccount-navigation');
                var select = document.createElement('select');

                select.classList.add('woocommerce-MyAccount-navigation-select');

                tabs.find('li').each(function () {
                    var option = document.createElement('option'),
                        link = $(this).children('a'),
                        isActive = $(this).hasClass('is-active');

                    option.setAttribute('value', link.attr('href'));

                    if (isActive) {
                        option.setAttribute('selected', 'selected');
                    }

                    option.innerHTML = link.html();

                    select.appendChild(option);
                });

                $(select).insertBefore(tabs);

                $(select).on('change', function () {
                    window.location.href = $(this).val();
                });
            }
        });
    };

    window.writsyShop = ws || {};

    return ws.init();

}(window, jQuery));