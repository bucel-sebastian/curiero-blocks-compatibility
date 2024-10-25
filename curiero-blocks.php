<?php

/**
 * Plugin Name: WooCommerce Blocks Checkout Shipping Extension
 * Description: Extends WooCommerce blocks checkout to update shipping package display
 * Version: 1.0.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit;
}


class WC_Blocks_Shipping_Extension
{
    public function __construct()
    {
        add_action('init', [$this, 'register_scripts']);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
    }

    public function register_scripts()
    {
        // Register our custom script
        wp_register_script(
            'wc-blocks-shipping-extension',
            plugins_url('build/index.js', __FILE__),
            ['wp-plugins', 'wp-blocks', 'wp-element', 'wp-components', 'wp-i18n', 'wc-blocks-checkout'],
            filemtime(plugin_dir_path(__FILE__) . 'build/index.js')
        );
    }

    public function enqueue_editor_assets()
    {
        wp_enqueue_script('wc-blocks-shipping-extension');
    }

    public function enqueue_frontend_assets()
    {
        if (has_block('woocommerce/checkout')) {
            wp_enqueue_style('select2-style', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css');

            wp_enqueue_script('jquery');

            wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', ['jquery'], null, true);
            wp_enqueue_script('wc-blocks-shipping-extension', ['jquery', 'select2'], null, true);

            wp_localize_script('select2', 'curieroBlocks', [
                "sameday" => [
                    "lockers" => [
                        ["key" => "001", "value" => "Locker 1"],
                        ["key" => "002", "value" => "Locker 2"],
                        ["key" => "003", "value" => "Locker 3"],
                        ["key" => "004", "value" => "Locker 4"],
                        ["key" => "005", "value" => "Locker 5"],
                        ["key" => "006", "value" => "Locker 6"],
                        ["key" => "007", "value" => "Locker 7"]
                    ],
                    "lockersMap" => true
                ],
         
            ]);
        }
    }
}


new WC_Blocks_Shipping_Extension();



// register_block_type('woocommerce/checkout-shipping-address-block', array(
//     'render_callback' => 'my_test_function',
// ));
// function my_test_function( $attributes, $content ) {
//     return '<h1>Block nou</h1>';
// }