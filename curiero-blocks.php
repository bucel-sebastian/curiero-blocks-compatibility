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

use function PHPSTORM_META\type;

if (!defined('ABSPATH')) {
    exit;
}


class WC_Blocks_Shipping_Extension
{

    private $shippingDest;

    public function __construct()
    {
        $this->shippingDest = get_option('woocommerce_ship_to_destination');

        add_action('init', [$this, 'register_scripts']);
        add_action('woocommerce_init', [$this, 'register_additional_checkout_fields']);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        add_action('woocommerce_blocks_loaded', [$this, 'curiero_blocks_loaded']);
        add_action('woocommerce_store_api_checkout_update_order_meta', [$this, 'curiero_blocks_store_api_checkout_update_order_meta']);

        add_filter('woocommerce_get_country_locale', [$this, 'curiero_blocks_change_checkout_fields']);

        add_action('wp_ajax_curiero_set_shipping_city', [$this, 'handle_set_shipping_city']);
        add_action('wp_ajax_nopriv_curiero_set_shipping_city', [$this, 'handle_set_shipping_city']);

        add_action('wp_ajax_curiero_get_cities_by_state', [$this, 'handle_get_cities_by_state']);
        add_action('wp_ajax_nopriv_curiero_get_cities_by_state', [$this, 'handle_get_cities_by_state']);

        add_action('wp_ajax_curiero_get_sameday_lockers', [$this, 'handle_get_sameday_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_sameday_lockers', [$this, 'handle_get_sameday_lockers']);

        add_action('wp_ajax_curiero_get_fancourier_lockers', [$this, 'handle_get_fancourier_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_fancourier_lockers', [$this, 'handle_get_fancourier_lockers']);

        add_action('wp_ajax_curiero_get_mygls_lockers', [$this, 'handle_get_mygls_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_mygls_lockers', [$this, 'handle_get_mygls_lockers']);
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
                'sameday' => [
                    'lockersMap' => true,
                    'selectedLocker' => WC()->session->get('curiero_sameday_selected_locker'),
                    'lockersMapClientId' => 'b8cb2ee3-41b9-4c3d-aafe-1527b453d65e'
                ],
                'fancourier' => [
                    'lockersMap' => true,
                    'selectedLocker' => WC()->session->get('curiero_fancourier_selected_locker'),
                ],
                'mygls' => [
                    'lockersMap' => true,
                    'selectedLocker' => WC()->session->get('curiero_mygls_selected_locker'),

                ],
                'i18n' => [
                    'citySelectDefault' => __('Selecteaza localitatea', 'curiero-plugin'),
                    'citySelectLoader' => __('Se incarca', 'curiero-plugin'),
                    'selectLockerTitle' => [
                        'sameday' => __('Alege punct EasyBox', 'curiero-plugin'),
                        'fancourier' => __('Alege punct FAN Box', 'curiero-plugin'),
                        'mygls' => __('Alege punct GLS Box', 'curiero-plugin'),
                    ],
                    'selectLockerPlaceholder' => __('Alege un locker', 'curiero-plugin'),
                    'selectLockerMapButton' => [
                        'sameday' => __('Arata Harta Easybox', 'curiero-plugin'),
                        'fancourier' => __('Arata Harta FAN Box', 'curiero-plugin'),
                        'mygls' => __('Arata Harta GLS Box', 'curiero-plugin'),
                    ]
                ],
                'shippingDest' => $this->shippingDest,
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('curiero_blocks_ajax_nonce')

            ]);
        }
    }

    public function register_additional_checkout_fields(): void
    {
        // woocommerce_register_additional_checkout_field(
        //     array(
        //         'id'       => 'CurieRO/city',
        //         'label'    => __('Localitate', 'curiero-plugin'),
        //         'location' => 'address',
        //         'type'     => 'select',
        //         'placeholder' => __('Selecteaza localitatea', 'curiero-plugin'),
        //         'options'  => array(
        //             ['value' => '', 'label' => '']
        //         ),
        //         'required' => true,
        //     )
        // );
    }


    public function curiero_blocks_change_checkout_fields($locale): array
    {
        $locale['RO'] = wp_parse_args(
            array(
                'state'      => [
                    'priority' => 50
                ],
                'city'       => [
                    'priority' => 60,
                    'type' => 'select',
                    'hidden'   => false,
                    'required' => true,
                ],
                // 'CurieRO/city' => [
                //     'priority' => 60,
                //     // 'hidden' => false,
                //     'required' => true,
                // ]

            ),
            $locale['RO'],
        );
        return $locale;
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
        $fancourierLockers = WC()->session->get('curiero_blocks_fancourier_lockers', []);
        $fancourierSelectedLocker = WC()->session->get('curiero_fancourier_selected_locker', null);
        $myglsLockers = WC()->session->get('curiero_blocks_mygls_lockers', []);
        $myglsSelectedLocker = WC()->session->get('curiero_mygls_selected_locker', null);
        return [
            // 'samedayLockers' => $samedayLockers,
            'samedaySelectedLocker' => $samedaySelectedLocker,
            'fancourierSelectedLocker' => $fancourierSelectedLocker,
            'myglsSelectedLocker' => $myglsSelectedLocker,
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
            'samedayLockers' => array(
                'description' => 'Available lockers',
                'type' => 'array',
                'items' => array(
                    'type' => 'object'
                )
            ),
            'samedaySelectedLocker' => array(
                'description' => 'Currently selected locker',
                'type' => 'object'
            )
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


                    if (isset($data['action'])) {

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

                            WC()->session->set('curiero_sameday_selected_locker', $locker_data);
                        }
                        if ($data['action'] === 'fancourier-set-selected-locker') {
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

                            WC()->session->set('curiero_fancourier_selected_locker', $locker_data);
                        }
                        if ($data['action'] === 'mygls-set-selected-locker') {
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

                            WC()->session->set('curiero_mygls_selected_locker', $locker_data);
                        }

                        if ($data['action'] === 'set-selected-city') {
                            $shipping_city = $data['city'];

                            WC()->session->set('curiero_selected_city', $shipping_city);
                            do_action('woocommerce_store_api_checkout_update_order_meta');
                        }
                    } else {
                    }
                }
            ]
        );
    }


    public function handle_get_cities_by_state()
    {

        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
            throw new Exception(__('Security check failed', 'curiero-plugin'));
        }

        $currentCountry = $_POST['country'];
        $currentState = $_POST['state'];
        if (class_exists('CurieRO_City_Select')) {
            $CurieROCitySelect = new CurieRO_City_Select();

            $cities = $CurieROCitySelect->get_cities($currentCountry);

            wp_send_json_success($cities[$currentState]);
        }
    }

    public function handle_get_sameday_lockers()
    {
        try {

            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('Sameday_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['sameday'];
                $lockers_list = $shipping_method->get_easybox_list($shipping_county, $shipping_city);

                WC()->session->set(
                    'curiero_blocks_sameday_lockers',
                    array_values($lockers_list->toArray())
                );

                wp_send_json_success([
                    'lockers' => array_values($lockers_list->toArray())
                ]);
            }
        } catch (Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function handle_get_fancourier_lockers()
    {
        try {
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('Fan_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['fan'];

                $lockers_list = $shipping_method->get_fanbox_list($shipping_county, $shipping_city);

                WC()->session->set(
                    'curiero_blocks_fancourier_lockers',
                    array_values($lockers_list->toArray())
                );

                wp_send_json_success([
                    'lockers' => array_values($lockers_list->toArray())
                ]);
            }
        } catch (Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function handle_get_mygls_lockers()
    {
        try {

            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('MyGLS_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['mygls'];
                $lockers_list = $shipping_method->get_mygls_box_list($shipping_county, $shipping_city);

                WC()->session->set(
                    'curiero_blocks_mygls_lockers',
                    array_values($lockers_list->toArray())
                );

                wp_send_json_success([
                    'lockers' => array_values($lockers_list->toArray())
                ]);
            }
        } catch (Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    function handle_set_shipping_city()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
            throw new Exception(__('Security check failed', 'curiero-plugin'));
        }

        $shipping_city = $_POST['city'];

        $customer = WC()->session->get('customer');
        $customer['city'] = $shipping_city;
        $customer['shipping_city'] = $shipping_city;

        WC()->session->set('customer', $customer);
    }

    /**
     * @param WC_Order $order
     * 
     * @return void
     */
    public function curiero_blocks_store_api_checkout_update_order_meta(WC_Order $order): void
    {

        $shipping_city = WC()->session->get('curiero_selected_city', '');

        $order->set_shipping_city("Test");
        $order->save();


        $locker_data = WC()->session->get('curiero_sameday_selected_locker');
        if (($locker_data)) {

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


add_filter('render_block_data', 'reorder_checkout_fields', 10, 3);

function reorder_checkout_fields($block_data, $block, $content)
{


    // error_log($block['blockName']);

    if ($block['blockName'] === 'woocommerce/checkout-shipping-address-block') {
        // error_log('');
        // error_log(' ' . json_encode($block));
        // error_log('');
        // error_log('Attrs ' . json_encode($block_data['attrs']));
        // error_log('');
        // error_log(' ' . json_encode($content));

        // error_log('');
        // error_log('');
        // error_log('');
    }
    // Check if this is the WooCommerce Checkout Fields block
    // if ($block['blockName'] === 'woocommerce/checkout-fields') {
    //     // Get the current field order
    //     $fields = $block_data['attrs']['fields'];

    //     // Reorder the shipping fields
    //     $shipping_fields = $fields['shipping'];
    //     $new_order = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country'];
    //     $shipping_fields = array_merge(array_flip($new_order), $shipping_fields);
    //     $fields['shipping'] = $shipping_fields;

    //     // Update the block data with the modified fields
    //     $block_data['attrs']['fields'] = $fields;
    // }

    return $block_data;
}
