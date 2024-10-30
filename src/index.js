import { registerPlugin } from "@wordpress/plugins";
import CurieROShippingLockers from "./CurieROShippingLockers";

import { registerCheckoutFilters } from "@wordpress/blocks-checkout";

import "./index.css";

const render = () => {
  const { ExperimentalOrderShippingPackages } =
    window?.wc?.blocksCheckout || {};

  // console.log(window.wc);
  // console.log(window.wc.checkout);
  // console.log(window.wc.blocksCheckout);
  // console.log(window.wc.wcBlocksSharedContext);
  // console.log(window.wc.wcBlocksSharedContext.useInnerBlockLayoutContext());
  // console.log(
  //   window.wc.wcBlocksSharedContext.InnerBlockLayoutContextProvider()
  // );
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

registerPlugin("curiero-blocks", {
  render,
  scope: "woocommerce-checkout",
});

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

// const renderCityField = ({ field, onChange }) => {
//   // Get cities from localized data
//   const cities = ["1",'2','3'];

//   return (
//       <select
//           id={field.id}
//           className="wc-block-components-select-control__input"
//           value={field.value}
//           onChange={(e) => onChange(e.target.value)}
//           required={field.required}
//       >
//           <option value="">{`Select a city...`}</option>
//           {cities.map((city) => (
//               <option key={city} value={city}>
//                   {city}
//               </option>
//           ))}
//       </select>
//   );
// };
