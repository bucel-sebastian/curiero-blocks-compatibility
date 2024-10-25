<?php

/**
 * Plugin Name: WooCommerce Blocks Checkout Shipping Extension
 * Description: Extends WooCommerce blocks checkout to update shipping package display
 * Version: 1.0.0
 * Author: Your Name
 * Requires Plugins: woocommerce
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

            if(class_exists('Sameday_Shipping_Method')){
                $SamedayShippingMethod = new CurieRO_Internal_Sameday_Request();
                $lockers_list = $SamedayShippingMethod->getLockers();
                // dd($lockers_list);

            }

            wp_localize_script('select2', 'curieroBlocks', [
                "sameday" => [
                    "lockers" => $lockers_list,
                    "lockersMap" => true
                ],
                'ajaxurl'=>admin_url('admin-ajax.php')
         
            ]);
        }
    }
}


new WC_Blocks_Shipping_Extension();



add_action('woocommerce_blocks_loaded', function() {
    woocommerce_store_api_register_update_callback(
      [
        'namespace' => 'curiero-blocks-namespace',
        'callback'  => function($data)  {
            if (isset($data['order_id']) && isset($data['locker'])) {
                $order_id = intval($data['order_id']);
                $shipping_address = sanitize_text_field($data['locker']);

                // Actualizează adresa de expediere
                update_post_meta($order_id, '_shipping_address_1', $shipping_address);

                error_log(" {$order_id} - {$shipping_address} ");

            } else {
       
            }
        }
      ]
    );
  } );