import { registerPlugin } from "@wordpress/plugins";
import { useSelect } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import LockersComponent from "./LockersComponent";

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

    return store.isShippingRateBeingSelected();
  }, []);

  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");

    return store.getCartData();
  }, []);
  const storeCart = useSelect((select) => {
    const store = select("wc/store/cart");

    return store;
  }, []);

  useEffect(() => {
    console.log(storeCartShippingRates, storeCheckoutOrderId, storeCartData);
  }, [storeCartShippingRates, storeCheckoutOrderId, storeCartData]);

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
