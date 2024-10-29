<?php

/**
 * Plugin Name: WooCommerce Blocks Checkout Shipping Extension
 * Description: Extends WooCommerce blocks checkout to update shipping package display
 * Version: 1.0.0
 * Author: Your Name
 * Requires Plugins: woocommerce
 */



use Automattic\WooCommerce\StoreApi\StoreApi;
use Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CheckoutSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;




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
        add_action('woocommerce_blocks_loaded', [$this, 'curiero_blocks_loaded']);
        add_action('woocommerce_store_api_checkout_update_order_meta', [$this, 'curiero_blocks_store_api_checkout_update_order_meta']);
    }

    public function register_scripts()
    {
        wp_register_script(
            'wc-blocks-shipping-extension',
            plugins_url('build/index.js', __FILE__),
            ['wp-plugins', 'wp-blocks', 'wp-element', 'wp-components', 'wp-i18n', 'wc-blocks-checkout', 'select2', 'jquery'],
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

            wp_localize_script('wc-blocks-shipping-extension', 'curieroBlocks', [
                "sameday" => [
                    "lockersMap" => true,
                    'selectedLocker' => WC()->session->get('curiero_sameday_selected_locker')
                ],
                'i18n' => [
                    'selectLockerTitle' => [
                        'sameday' => __('Alege punct EasyBox', 'curiero-plugin'),
                    ],
                    'selectLockerPlaceholder' => __('Alege un locker', 'curiero-plugin'),
                    'selectLockerMapButton' => [
                        'sameday' => __('Arata Harta Easybox', 'curiero-plugin')
                    ]
                ],
                'ajaxurl' => admin_url('admin-ajax.php')

            ]);
        }
    }

    /**
     * Add data in Store API 
     * 
     * @return array
     */
    public function CurieRO_blocks_data_callback(): array
    {
        $samedayLockers = WC()->session->get('curiero_blocks_sameday_lockers', []);
        $samedaySelectedLocker = WC()->session->get('curiero_sameday_selected_locker', null);
        return [
            'samedayLockers' => $samedayLockers,
            'samedaySelectedLocker' => $samedaySelectedLocker
        ];
    }

    /**
     * Store API data schema
     * 
     * @return array
     */
    public function CurieRO_blocks_schema_callback(): array
    {
        return [
            'custom-key' => [
                'description' => 'CurieRO Namespace',
                'type' => 'string',
                'readonly' => true,
            ]
        ];
    }

    /**
     *  Store API endpoint and callbacks
     * 
     * @return void
     */
    public function curiero_blocks_loaded(): void
    {
        woocommerce_store_api_register_endpoint_data(
            array(
                'endpoint' => CartSchema::IDENTIFIER,
                'namespace' => 'CurieRO-blocks',
                'data_callback' => [$this, 'CurieRO_blocks_data_callback'],
                'schema_callback' => [$this, 'CurieRO_blocks_schema_callback'],
                'schma_type' => ARRAY_A
            )
        );
        woocommerce_store_api_register_update_callback(
            [
                'namespace' => 'CurieRO-blocks',
                'callback' => function ($data) {
                    error_log("Callback triggered " . json_encode($data));

                    if (isset($data['action'])) {

                        if ($data['action'] === 'sameday-get-lockers') {
                            if (class_exists('Sameday_Shipping_Method')) {
                                $shipping_city = WC()->session->get('customer')['shipping_city'];
                                $shipping_county = WC()->session->get('customer')['shipping_state'];
                                $shipping_country = WC()->session->get('customer')['shipping_country'];

                                $shipping_method = WC()->shipping->get_shipping_methods()['sameday'];
                                $lockers_list = $shipping_method->get_easybox_list($shipping_county, $shipping_city, $shipping_country);

                                error_log("Lockers list array " . json_encode(array_values($lockers_list->toArray())));


                                WC()->session->set(
                                    'curiero_blocks_sameday_lockers',
                                    array_values($lockers_list->toArray())
                                );
                            }
                        }

                        if ($data['action'] === 'sameday-set-selected-locker') {
                            if (!isset($data['order_id']) || !isset($data['locker'])) {
                                return new WP_Error(
                                    'missing_data',
                                    'Missing required locker data',
                                    ['status' => 400]
                                );
                            }

                            $locker_data = is_string($data['locker']) ? json_decode(stripslashes($data['locker']), true) :
                                $data['locker'];

                            if (!$locker_data) {
                                return new WP_Error(
                                    'invalid_locker_data',
                                    'Invalid locker data format',
                                    ['status' => 400]
                                );
                            }
                            error_log("Set selected locker - " . json_encode($locker_data));

                            WC()->session->set('curiero_sameday_selected_locker', $locker_data);
                        }
                    } else {
                    }
                }
            ]
        );
    }


    /**
     * @param WC_Order $order
     * 
     * @return void
     */
    public function curiero_blocks_store_api_checkout_update_order_meta(WC_Order $order): void
    {
        $locker_data = WC()->session->get('curiero_sameday_selected_locker');
        if (($locker_data)) {
            error_log("Is not empty ");

            $order->update_meta_data('curiero_sameday_lockers', $locker_data['id']);
            $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);

            $shipping_method = WC()->shipping->get_shipping_methods()['sameday'];
            if ($shipping_method && $shipping_method->get_option('locker_shipping_address') === 'yes') {
                curiero_force_locker_shipping_address($order, $locker_data['name'], $locker_data['address']);
            }

            $order->save();
            WC()->session->set('curiero_sameday_selected_locker', null);
            WC()->session->set('curiero_blocks_sameday_lockers', []);
        }
    }
}


new WC_Blocks_Shipping_Extension();
