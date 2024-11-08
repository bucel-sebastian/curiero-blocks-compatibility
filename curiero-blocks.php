<?php

/**
 * Plugin Name: CurieRO Blocks
 * Description: Extends WooCommerce blocks checkout to update shipping package display
 * Version: 1.0.0
 * Author: Your Name
 * Requires Plugins: woocommerce
 */



use Automattic\WooCommerce\StoreApi\StoreApi;
use Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CheckoutSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;

use Automattic\WooCommerce\Blocks\Package;
use Automattic\WooCommerce\Blocks\Domain\Services\CheckoutFields;

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

        add_action('wp_ajax_curiero_get_fancourier_collectpoints', [$this, 'handle_get_fancourier_collectpoints']);
        add_action('wp_ajax_nopriv_curiero_get_fancourier_collectpoints', [$this, 'handle_get_fancourier_collectpoints']);

        add_action('wp_ajax_curiero_get_mygls_lockers', [$this, 'handle_get_mygls_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_mygls_lockers', [$this, 'handle_get_mygls_lockers']);

        add_action('wp_ajax_curiero_get_urgentcargus_lockers', [$this, 'handle_get_urgentcargus_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_urgentcargus_lockers', [$this, 'handle_get_urgentcargus_lockers']);

        add_action('wp_ajax_curiero_get_dpd_lockers', [$this, 'handle_get_dpd_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_dpd_lockers', [$this, 'handle_get_dpd_lockers']);

        add_action('wp_ajax_curiero_get_innoship_lockers', [$this, 'handle_get_innoship_lockers']);
        add_action('wp_ajax_nopriv_curiero_get_innoship_lockers', [$this, 'handle_get_innoship_lockers']);


        add_filter('woocommerce_blocks_checkout_update_order_review_data', [$this, 'curiero_blocks_update_checkout_fields'], 10, 1);
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
                    'citySelectNoState' => __('Va rugam sa selectati un judet', 'curiero-plugin'),
                    'citySelectLoader' => __('Se incarca', 'curiero-plugin'),
                    'selectLockerTitle' => [
                        'sameday' => __('Alege punct EasyBox', 'curiero-plugin'),
                        'fancourier' => __('Alege punct FAN Box', 'curiero-plugin'),
                        'mygls' => __('Alege punct GLS Box', 'curiero-plugin'),
                        'urgentcargus' => __('Alege punct Ship & Go', 'curiero-plugin'),
                        'dpd' => __('Alege punct de ridicare', 'curiero-plugin'),
                        'innoship' => __('Alege Locker', 'curiero-plugin'),
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
        $options = get_option('curiero_pf_pj_option', []);
        $PFPJClass = new CurieRO_PFPJ_Checkout_Form();
        $options = wp_parse_args($options, $PFPJClass->retrieve_defaults());

        error_log("pfpj options " . json_encode($options));

        woocommerce_register_additional_checkout_field(
            [
                'id' => 'CurieRO/pfpj',
                'label'    => $options['curiero_pf_pj_label'] ?? esc_html__('Tip Client', 'curiero-plugin'),
                'location' => 'address',
                'type'     => $options['curiero_pf_pj_output'] ?? "select",
                'placeholder' => __('Selecteaza tipul de client', 'curiero-plugin'),
                'options'  => [
                    ['value' => 'pers-fiz', 'label' => $options['curiero_pfiz_label'] ?? esc_html__('Persoana Fizica', 'curiero-plugin')],
                    ['value' => 'pers-jur', 'label' => $options['curiero_pjur_label'] ?? esc_html__('Persoana Juridica', 'curiero-plugin')],
                ],
                'validate_callback' => function ($field_value) {
                    error_log("PFPJ VALIDATE " . $field_value);
                },
                'required' => true,
            ]
        );

        $extra_fields = [];
        if ('yes' === $options['curiero_pfiz_cnp_visibility']) {
            $extra_fields['cnp'] = [
                'id' => 'CurieRO/cnp',
                'type' => 'text',
                'label' => $options['curiero_pfiz_cnp_label'],
                'placeholder' => $options['curiero_pfiz_cnp_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_fiz validate-required'],
                'needed_req' => $options['curiero_pfiz_cnp_required'],
            ];
        }
        // Company Field
        if ('yes' === $options['curiero_pjur_company_visibility']) {
            $extra_fields['billing_company'] = [
                'id' => 'CurieRO/billing_company',
                'type' => 'text',
                'label' => $options['curiero_pjur_company_label'],
                'placeholder' => $options['curiero_pjur_company_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_jur validate-required'],
                'needed_req' => $options['curiero_pjur_company_required'],
            ];
        }

        // CUI Field
        if ('yes' === $options['curiero_pjur_cui_visibility']) {
            $extra_fields['cui'] = [
                'id' => 'CurieRO/cui',
                'type' => 'text',
                'label' => $options['curiero_pjur_cui_label'],
                'placeholder' => $options['curiero_pjur_cui_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_jur validate-required'],
                'needed_req' => $options['curiero_pjur_cui_required'],
            ];
        }

        // Nr. Reg. Com Field
        if ('yes' === $options['curiero_pjur_nr_reg_com_visibility']) {
            $extra_fields['nr_reg_com'] = [
                'id' => 'CurieRO/nr_reg_com',
                'type' => 'text',
                'label' => $options['curiero_pjur_nr_reg_com_label'],
                'placeholder' => $options['curiero_pjur_nr_reg_com_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_jur validate-required'],
                'needed_req' => $options['curiero_pjur_nr_reg_com_required'],
            ];
        }

        // Nume Banca Field
        if ('yes' === $options['curiero_pjur_nume_banca_visibility']) {
            $extra_fields['nume_banca'] = [
                'id' => 'CurieRO/nume_banca',
                'type' => 'text',
                'label' => $options['curiero_pjur_nume_banca_label'],
                'placeholder' => $options['curiero_pjur_nume_banca_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_jur validate-required'],
                'needed_req' => $options['curiero_pjur_nume_banca_required'],
            ];
        }

        // IBAN Field
        if ('yes' === $options['curiero_pjur_iban_visibility']) {
            $extra_fields['iban'] = [
                'id' => 'CurieRO/iban',
                'type' => 'text',
                'label' => $options['curiero_pjur_iban_label'],
                'placeholder' => $options['curiero_pjur_iban_placeholder'],
                'priority' => 25,
                'clear' => true,
                'class' => ['form-row-wide', 'show_if_pers_jur validate-required'],
                'needed_req' => false,
            ];
        }

        foreach ($extra_fields as $field) {
            woocommerce_register_additional_checkout_field(
                [
                    'id' => $field['id'],
                    'label' => $field['label'],
                    'location' => 'address',
                    'type' => $field['type'],
                    'placeholder' => '',
                    'priority' => 3,
                    'class' => $field['class'],
                    // 'hidden' => true,
                    // 'required' => false

                ]
            );
        }


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
        // //     )
        // );
    }


    public function curiero_blocks_change_checkout_fields($locale): array
    {
        error_log("locale " . json_encode($locale['RO']));
        error_log("option " . get_option('disable_zipcode_in_checkout'));

        $options = get_option('curiero_pf_pj_option', []);
        $PFPJClass = new CurieRO_PFPJ_Checkout_Form();
        $options = wp_parse_args($options, $PFPJClass->retrieve_defaults());



        $field_id = 'CurieRO/pfpj';
        $customer = wc()->customer; // Or new WC_Customer( $id )
        $checkout_fields = Package::container()->get(CheckoutFields::class);
        $my_customer_billing_field = $checkout_fields->get_field_from_object($field_id, $customer, 'billing');
        $my_customer_billing_field_state = $checkout_fields->get_field_from_object($field_id, $customer, 'billing');

        error_log("PFPJ value billing " . json_encode($my_customer_billing_field));

        $my_customer_shipping_field = $checkout_fields->get_field_from_object($field_id, $customer, 'shipping');
        error_log("PFPJ value shipping " . json_encode($my_customer_shipping_field));

        $disable_zipcode_in_checkout = get_option('disable_zipcode_in_checkout');
        foreach ($locale as $key => $fields) {
            if ($key !== 'RO') {
                $locale[$key] = wp_parse_args(array(
                    'CurieRO/pfpj' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/cnp' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/billing_company' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/cui' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/nr_reg_com' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/nume_banca' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],
                    'CurieRO/iban' => [
                        'priority' => 2,
                        'hidden' => true,
                        'required' => false,
                    ],


                    // 'CurieRO/city' => [
                    //     'priority' => 60,
                    //     // 'hidden' => false,
                    //     'required' => true,
                    // ]

                ), $locale[$key]);
            }
        }
        $locale['RO'] = wp_parse_args(
            array(
                'CurieRO/pfpj' => [
                    'priority' => 2,
                ],
                'CurieRO/cnp' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-fiz' ? 'yes' !== $options['curiero_pfiz_cnp_visibility'] : true,
                    'required' => $options['curiero_pfiz_cnp_required'],
                ],
                'CurieRO/billing_company' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-jur' ? 'yes' !== $options['curiero_pjur_company_visibility'] : true,
                    'required' => $options['curiero_pjur_company_required'],
                ],
                'CurieRO/cui' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-jur' ? 'yes' !== $options['curiero_pjur_cui_visibility'] : true,
                    'required' => $options['curiero_pjur_cui_required'],
                ],
                'CurieRO/nr_reg_com' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-jur' ? 'yes' !== $options['curiero_pjur_nr_reg_com_visibility'] : true,
                    'required' => $options['curiero_pjur_nr_reg_com_required'],
                ],
                'CurieRO/nume_banca' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-jur' ? 'yes' !== $options['curiero_pjur_nume_banca_visibility'] : true,
                    'required' => $options['curiero_pjur_nume_banca_required'],
                ],
                'CurieRO/iban' => [
                    'priority' => 2,
                    'hidden' => $my_customer_billing_field === 'pers-jur' ? 'yes' !== $options['curiero_pjur_iban_visibility'] : true,
                    'required' => false,
                ],
                'country' => [
                    'priority' => 1,
                ],
                'state'      => [
                    'priority' => 50
                ],
                'city'       => [
                    'priority' => 60,
                    'type' => 'select',
                    'hidden'   => false,
                    'required' => true,
                ],
                'postcode'   => [
                    'hidden' => $disable_zipcode_in_checkout === '0' ? false : true
                ]

                // 'CurieRO/city' => [
                //     'priority' => 60,
                //     // 'hidden' => false,
                //     'required' => true,
                // ]

            ),
            $locale['RO'],
        );

        error_log("locale ro " . json_encode($locale['RO']));
        return $locale;
    }

    public function curiero_blocks_update_checkout_fields($order_data)
    {
        // Parse the post data to get the 'CurieRO/pfpj' value
        // parse_str($post_data, $data);

        error_log("Review " . json_encode($order_data));

        $pfpj_value = $data['CurieRO/pfpj'] ?? '';

        // Call your existing function to update the checkout fields
        $updated_locale = $this->curiero_blocks_change_checkout_fields(['RO' => []]);

        // Return the updated locale array
        return $updated_locale;
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
        $urgentcargusLockers = WC()->session->get('curiero_blocks_urgentcargus_lockers', []);
        $urgentcargusSelectedLocker = WC()->session->get('curiero_urgentcargus_selected_locker', null);

        $dpdLockers = WC()->session->get('curiero_blocks_dpd_lockers', []);
        $dpdSelectedLocker = WC()->session->get('curiero_dpd_selected_locker', null);
        $innoshipLockers = WC()->session->get('curiero_blocks_innoship_lockers', []);
        $innoshipSelectedLocker = WC()->session->get('curiero_innoship_selected_locker', null);

        $fancourierCollectpoints = WC()->session->get('curiero_blocks_fancourier_collectpoints', []);
        $fancourierSelectedCollectpoint = WC()->session->get('curiero_fancourier_selected_collectpoint', null);


        error_log(json_encode([
            // 'samedayLockers' => $samedayLockers,a
            'samedaySelectedLocker' => $samedaySelectedLocker,
            'fancourierSelectedLocker' => $fancourierSelectedLocker,
            'myglsSelectedLocker' => $myglsSelectedLocker,
            'urgentcargusSelectedLocker' => $urgentcargusSelectedLocker,
            'dpdSelectedLocker' => $dpdSelectedLocker,
            'innoshipSelectedLocker' => $innoshipSelectedLocker,
        ]));

        return [
            // 'samedayLockers' => $samedayLockers,
            'samedaySelectedLocker' => $samedaySelectedLocker,
            'fancourierSelectedCollectpoint' => $fancourierSelectedCollectpoint,
            'fancourierSelectedLocker' => $fancourierSelectedLocker,
            'myglsSelectedLocker' => $myglsSelectedLocker,
            'urgentcargusSelectedLocker' => $urgentcargusSelectedLocker,
            'dpdSelectedLocker' => $dpdSelectedLocker,
            'innoshipSelectedLocker' => $innoshipSelectedLocker,
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


                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_dpd_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);
                            WC()->session->set('curiero_fancourier_selected_locker', null);
                            WC()->session->set('curiero_mygls_selected_locker', null);
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

                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_dpd_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);

                            WC()->session->set('curiero_mygls_selected_locker', null);
                        }
                        if ($data['action'] === 'fancourier-set-selected-collectpoint') {
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

                            WC()->session->set('curiero_fancourier_selected_collectpoint', $locker_data);
                            WC()->session->set('curiero_fancourier_selected_locker', null);

                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_dpd_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);

                            WC()->session->set('curiero_mygls_selected_locker', null);
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

                            error_log("MYGLS LOCKER " . json_encode($locker_data));

                            if (!$locker_data) {
                                return new WP_Error(
                                    'invalid_locker_data',
                                    'Invalid locker data format',
                                    ['status' => 400]
                                );
                            }

                            WC()->session->set('curiero_mygls_selected_locker', $locker_data);

                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_dpd_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);
                            WC()->session->set('curiero_fancourier_selected_locker', null);
                        }
                        if ($data['action'] === 'urgentcargus-set-selected-locker') {
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


                            WC()->session->set('curiero_urgentcargus_selected_locker', $locker_data);

                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_dpd_selected_locker', null);

                            WC()->session->set('curiero_fancourier_selected_locker', null);
                            WC()->session->set('curiero_mygls_selected_locker', null);
                        }
                        if ($data['action'] === 'dpd-set-selected-locker') {
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


                            WC()->session->set('curiero_dpd_selected_locker', $locker_data);

                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);
                            WC()->session->set('curiero_fancourier_selected_locker', null);
                            WC()->session->set('curiero_mygls_selected_locker', null);
                        }
                        if ($data['action'] === 'innoship-set-selected-locker') {
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

                            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
                            WC()->session->set('curiero_sameday_selected_locker', null);
                            WC()->session->set('curiero_innoship_selected_locker', $locker_data);
                            WC()->session->set('curiero_dpd_selected_locker', null);
                            WC()->session->set('curiero_urgentcargus_selected_locker', null);
                            WC()->session->set('curiero_fancourier_selected_locker', null);
                            WC()->session->set('curiero_mygls_selected_locker', null);
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

                error_log("lockers FAN " . $shipping_county . " " . json_encode($lockers_list));

                WC()->session->set(
                    'curiero_blocks_fancourier_lockers',
                    array_values($lockers_list->toArray())
                );
                WC()->session->set('curiero_sameday_selected_locker', null);
                WC()->session->set('curiero_mygls_selected_locker', null);

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

    public function handle_get_fancourier_collectpoints()
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

                $lockers_list = $shipping_method->get_collectpoint_list($shipping_county, $shipping_city);

                error_log("Collect points FAN " . $shipping_county . " " . json_encode($lockers_list));

                WC()->session->set(
                    'curiero_blocks_fancourier_collectpoints',
                    array_values($lockers_list->toArray())
                );
                WC()->session->set('curiero_sameday_selected_locker', null);
                WC()->session->set('curiero_mygls_selected_locker', null);

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

                error_log("lockers " . json_encode($lockers_list));

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

    public function handle_get_urgentcargus_lockers()
    {
        try {

            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('Cargus_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['urgentcargus_courier'];
                $lockers_list = $shipping_method->get_locker_list($shipping_county, $shipping_city);

                WC()->session->set(
                    'curiero_blocks_urgentcargus_lockers',
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
    public function handle_get_dpd_lockers()
    {
        try {

            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('DPD_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['dpd'];
                $lockers_list = $shipping_method->get_dpdbox_list($shipping_city);

                WC()->session->set(
                    'curiero_blocks_dpd_lockers',
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
    public function handle_get_innoship_lockers()
    {
        try {

            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'curiero_blocks_ajax_nonce')) {
                throw new Exception(__('Security check failed', 'curiero-plugin'));
            }


            if (class_exists('Innoship_Shipping_Method')) {
                $shipping_city = $_POST['city'];
                $shipping_county = $_POST['state'];

                $customer = WC()->session->get('customer');
                $customer['shipping_state'] = $shipping_county;
                WC()->session->set('customer', $customer);

                $shipping_method = WC()->shipping->get_shipping_methods()['innoship'];
                $lockers_list = $shipping_method->get_locker_list($shipping_county, $shipping_city);

                WC()->session->set(
                    'curiero_blocks_innoship_lockers',
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
        error_log('Intra');

        $shipping_city = WC()->session->get('curiero_selected_city', '');

        $order->set_shipping_city("Test");
        $order->save();

        $sameday_selected_locker = WC()->session->get('curiero_sameday_selected_locker');
        $fancourier_selected_locker = WC()->session->get('curiero_fancourier_selected_locker');
        $fancourier_selected_collectpoint = WC()->session->get('curiero_fancourier_selected_collectpoint');
        $mygls_selected_locker = WC()->session->get('curiero_mygls_selected_locker');
        $urgentcargus_selected_locker = WC()->session->get('curiero_urgentcargus_selected_locker');
        $dpd_selected_locker = WC()->session->get('curiero_dpd_selected_locker');
        $innoship_selected_locker = WC()->session->get('curiero_innoship_selected_locker');


        if ($sameday_selected_locker) {
            $selected_locker = 'sameday';
            $locker_data = $sameday_selected_locker;
        }
        if ($fancourier_selected_locker) {
            $selected_locker = 'fancourier';
            $locker_data = $fancourier_selected_locker;
        }
        if ($fancourier_selected_collectpoint) {
            $selected_locker = 'fancourier_collectpoint';
            $locker_data = $fancourier_selected_collectpoint;
        }
        if ($mygls_selected_locker) {
            $selected_locker = 'mygls';
            $locker_data = $mygls_selected_locker;
        }
        if ($urgentcargus_selected_locker) {
            $selected_locker = 'urgentcargus';
            $locker_data = $urgentcargus_selected_locker;
        }
        if ($dpd_selected_locker) {
            $selected_locker = 'dpd';
            $locker_data = $dpd_selected_locker;
        }
        if ($innoship_selected_locker) {
            $selected_locker = 'innoship';
            $locker_data = $innoship_selected_locker;
        }

        if ($selected_locker) {

            if ($selected_locker === 'sameday') {
                $order->update_meta_data('curiero_sameday_lockers', $locker_data['id']);
                $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'fancourier') {
                $order->update_meta_data('curiero_fan_fanbox', $locker_data['id']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'fancourier_collectpoint') {
                $order->update_meta_data('curiero_fan_collectpoint', $locker_data['id']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'mygls') {
                $order->update_meta_data('curiero_mygls_box', $locker_data['id']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'urgentcargus') {
                $order->update_meta_data('curiero_cargus_locker', $locker_data['id']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'dpd') {
                $order->update_meta_data('curiero_dpd_box', $locker_data['id']);
                $order->update_meta_data('curiero_dpd_box_address', $locker_data['address']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }
            if ($selected_locker === 'innoship') {
                $order->update_meta_data('curiero_innoship_locker', $locker_data['id']);
                // $order->update_meta_data('curiero_sameday_locker_name', $locker_data['name']);
            }

            $shipping_method = WC()->shipping->get_shipping_methods()['sameday'];
            if ($shipping_method && $shipping_method->get_option('locker_shipping_address') === 'yes') {
                curiero_force_locker_shipping_address($order, $locker_data['name'], $locker_data['address']);
            }

            $order->save();
            WC()->session->set('curiero_sameday_selected_locker', null);
            WC()->session->set('curiero_fancourier_selected_locker', null);
            WC()->session->set('curiero_fancourier_selected_collectpoint', null);
            WC()->session->set('curiero_mygls_selected_locker', null);
            WC()->session->set('curiero_urgentcargus_selected_locker', null);
            WC()->session->set('curiero_dpd_selected_locker', null);
            WC()->session->set('curiero_innoship_selected_locker', null);
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



function render_custom_pfpj_block_before_checkout_billing()
{
    error_log("triggered");
?>
    <div id="custom-pfpj-block-container"></div> <!-- Container for the block -->
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {
            console.log("triggered");
            if (window.wp && window.wp.blocks) {
                wp.blocks.render(
                    'curiero/pfpj-block', // The block name
                    document.getElementById('custom-pfpj-block-container') // The container element
                );
            }
        });
    </script>
<?php
}
add_action('woocommerce_checkout_before_customer_details', 'render_custom_pfpj_block_before_checkout_billing');
