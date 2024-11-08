import { registerPlugin } from "@wordpress/plugins";
import CurieROShippingLockers from "./CurieROShippingLockers";
import { addFilter, addAction } from "@wordpress/hooks";
import { registerBlockType } from "@wordpress/blocks";

import { registerCheckoutFilters } from "@wordpress/blocks-checkout";

import "./index.css";
import ExternalDOMManipulation from "./ExternalDOMManipulation";
import PfpjBlock from "./PfpjBlock";

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
      <ExternalDOMManipulation />
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

// TRIGERS
addAction(
  "experimental__woocommerce_blocks-checkout-set-billing-address",
  "curiero/test",
  async () => {
    console.log("triggered");
    var event = new Event("update_checkout");
    document.body.dispatchEvent(event);

    // console.log(await applyCheckoutFilter());
  }
);

registerBlockType("curiero/pfpj-block", {
  title: "PF/PJ Billing Fields",
  description: "A custom block for adding PF/PJ related billing fields.",
  category: "woocommerce", // WooCommerce block category
  icon: "admin-users", // You can use an existing WordPress icon here
  edit: PfpjBlock, // The component we created
  save: () => null, // This is a dynamic block, so no need to save anything
});

registerPlugin("curiero-blocks", {
  render,
  scope: "woocommerce-checkout",
});
