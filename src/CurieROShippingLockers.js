import { registerPlugin } from "@wordpress/plugins";
import { useSelect } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import LockersComponent from "./LockersComponent";

// import { store as noticesStore } from "@wordpress/notices";
// const notices = useSelect((select) => {
//   const store = select(noticesStore);

//   return store.getNotices();
// }, []);

const lockers_id = ["curiero_sameday_lockers"];

function CurieROShippingLockers() {
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);

  const storeCheckoutOrderId = useSelect((select) => {
    const store = select("wc/store/checkout");

    return store.getOrderId();
  }, []);
  const storeCartShippingRates = useSelect((select) => {
    const store = select("wc/store/cart");

    return store.getShippingRates();
  }, []);

  const storeIsShippingRateBeingSelected = useSelect((select) => {
    const store = select("wc/store/cart");
    console.log(store.isShippingRateBeingSelected());
    return store.isShippingRateBeingSelected();
  }, []);

  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");
    console.log(store.getCartData());
    return store.getCartData();
  }, []);
  const storeCart = useSelect((select) => {
    const store = select("wc/store/cart");

    return store;
  }, []);

  // useEffect(() => {
  //   console.log(storeCartShippingRates, storeCheckoutOrderId, storeCartData);
  // }, [storeCartShippingRates, storeCheckoutOrderId, storeCartData]);

  useEffect(() => {
    const shippingRates = storeCartShippingRates[0]?.shipping_rates || [];
    const newSelectedShippingRate = shippingRates.find(
      (rate) => rate.selected === true
    );

    setSelectedShippingRate(newSelectedShippingRate);
  }, [storeCartShippingRates]);

  useEffect(() => {}, []);

  useEffect(() => {
    // Repopulate the city selector
  }, [storeCartData.shippingAddress.state]);

  return (
    <>
      {selectedShippingRate !== null ? (
        <>
          <div
            className={`wc-block-components-shipping-rates-control ${
              storeIsShippingRateBeingSelected
                ? "CurieRO-wc-block-disabled"
                : ""
            }`}
          >
            <div className="shipping-method-content">
              <LockersComponent
                rateId={selectedShippingRate?.rate_id}
                orderId={storeCheckoutOrderId}
                cartData={storeCartData}
                shippingRates={storeCartShippingRates}

                // storeCart={storeCart}
              />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default CurieROShippingLockers;

const rates = [
  {
    rate_id: "free_shipping:1",
    name: "Livrare gratuită",
    description: "",
    delivery_time: "",
    price: "0",
    taxes: "0",
    instance_id: 1,
    method_id: "free_shipping",
    meta_data: [
      {
        key: "Items",
        value: "Demo &times; 1",
      },
    ],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "fan",
    name: "Fan Courier",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "fan",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "curiero_fan_fanbox",
    name: "Fan Courier FANBox",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "fan",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "urgentcargus_courier",
    name: "Cargus",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "urgentcargus_courier",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "urgentcargus_courier_ship_and_go",
    name: "Cargus Ship &amp; Go",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "urgentcargus_courier",
    meta_data: [],
    selected: true,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "gls",
    name: "GLS",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "gls",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "mygls",
    name: "GLS",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "mygls",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "curiero_mygls_box",
    name: "GLS Box",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "mygls",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "dpd",
    name: "DPD",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "dpd",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "curiero_dpd_box",
    name: "DPDBox",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "dpd",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "sameday",
    name: "Sameday: Gratuit",
    description: "",
    delivery_time: "",
    price: "0",
    taxes: "0",
    instance_id: 0,
    method_id: "sameday",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "curiero_sameday_lockers",
    name: "Sameday EasyBox",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "sameday",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "innoship",
    name: "Innoship",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "innoship",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "curiero_innoship_locker",
    name: "Innoship Locker",
    description: "",
    delivery_time: "",
    price: "1500",
    taxes: "0",
    instance_id: 0,
    method_id: "innoship",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "bookurier",
    name: "Bookurier",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "bookurier",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "memex",
    name: "PTT Express",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "memex",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "optimus",
    name: "OptimusCourier",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "optimus",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "express",
    name: "Express",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "express",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
  {
    rate_id: "team",
    name: "TeamCourier",
    description: "",
    delivery_time: "",
    price: "1800",
    taxes: "0",
    instance_id: 0,
    method_id: "team",
    meta_data: [],
    selected: false,
    currency_code: "RON",
    currency_symbol: "lei",
    currency_minor_unit: 2,
    currency_decimal_separator: ",",
    currency_thousand_separator: ".",
    currency_prefix: "",
    currency_suffix: " lei",
  },
];
