import { registerPlugin } from "@wordpress/plugins";
import { useSelect } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import LockersComponent from "./LockersComponent";

import {registerCheckoutFilters} from "@wordpress/blocks-checkout"

import "./index.css";


const lockers_id = ["curiero_sameday_lockers"];

const CurieROShippingLockers = () => {
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
};







const render = () => {
  const { ExperimentalOrderShippingPackages } =
    window?.wc?.blocksCheckout || {};

  // If the component isn't available, render nothing
  if (!ExperimentalOrderShippingPackages) {
    console.warn("ExperimentalOrderShippingPackages not available");
    return null;
  }

  return (
    <>
      <ExperimentalOrderShippingPackages>
        <CurieROShippingLockers />
      </ExperimentalOrderShippingPackages>
    </>
  );
};

// registerCheckoutFilters('curiero-blocks', {
//   placeOrderButtonLabel: () => {
//     console.log("works - placeOrderButtonLabel");
//     return "Test"
//   },
//   hasCalculatedShipping: () => {

//     console.log("works - hasCalculatedShipping");
//     return false
//   },
//   shippingAddress: {
//     city: () => {
//       console.log("works - shippingAddress.city");
//       return "Test city";
//     }
//   }
// });

const renderCityField = ({ field, onChange }) => {
  // Get cities from localized data
  const cities = ["1",'2','3'];
  
  return (
      <select
          id={field.id}
          className="wc-block-components-select-control__input"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
      >
          <option value="">{`Select a city...`}</option>
          {cities.map((city) => (
              <option key={city} value={city}>
                  {city}
              </option>
          ))}
      </select>
  );
};

// Register the checkout filter
registerCheckoutFilters('city-select-plugin', {
  billing: {
      city: {
          render: renderCityField,
      },
  },
  shipping: {
      city: {
          render: renderCityField,
      },
  },
});

registerPlugin("curiero-blocks", {
  render,
  scope: "woocommerce-checkout",
});
