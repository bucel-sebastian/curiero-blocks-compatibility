import { registerPlugin } from "@wordpress/plugins";
import { useSelect } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import LockersComponent from "./LockersComponent";

const lockers_id = ["curiero_sameday_lockers"];

function CurieROShippingLockers() {
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const shippingRate = useSelect((select) => {
    const store = select("wc/store/cart");
    const shippingData = store.getShippingRates();
    const shippingRates = shippingData[0]?.shipping_rates || [];

    const selectedRate = shippingRates.find((rate) => rate.selected === true);

    return selectedRate || null;
  }, []);

  useEffect(() => {
    if (shippingRate && lockers_id.includes(shippingRate.rate_id)) {
      setSelectedShippingRate(`${shippingRate.rate_id}`);
    } else {
      setSelectedShippingRate(null);
    }
  }, [shippingRate]);

  return (
    <>
      {selectedShippingRate !== null ? (
        <>
          <div className="wc-block-components-shipping-rates-control">
            <div className="shipping-method-content">
              <LockersComponent rateId={selectedShippingRate} />
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
