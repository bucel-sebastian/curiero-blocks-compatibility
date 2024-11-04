import { useEffect, useRef, useState, createRoot } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import ShippingCitySelect from "./city-select-components/ShippingCitySelect";
import BillingCitySelect from "./city-select-components/BillingCitySelect";

function ExternalDOMManipulation() {
  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");
    const cartData = store.getCartData();

    return cartData;
  });

  const renderShippingCitySelector = () => {
    if (!document.querySelector("#shipping-city")) {
      setTimeout(() => {
        renderShippingCitySelector();
      }, 100);
      return;
    }

    const shippingCityInput = document.getElementById("shipping-city");
    const shippingCityContainer = document.getElementById(
      "CurieRO-shipping-city-container"
    );

    if (shippingCityInput && !shippingCityContainer) {
      const container = document.createElement("div");
      container.id = "CurieRO-shipping-city-container";

      if (storeCartData.shippingAddress.country === "RO") {
        shippingCityInput.parentNode.insertBefore(
          container,
          shippingCityInput.nextSibling
        );

        const root = createRoot(container);
        shippingCityInput.setAttribute("type", "hidden");

        shippingCityInput.parentNode
          .querySelector("label")
          .classList.add("CurieRO-select__label");

        root.render(
          <>
            <ShippingCitySelect initialData={storeCartData.shippingAddress} />
          </>
        );
      }
    }
  };

  const renderBillingCitySelector = () => {
    if (!document.querySelector("#billing-city")) {
      setTimeout(() => {
        renderBillingCitySelector();
      }, 100);
      return;
    }

    const billingCityInput = document.getElementById("billing-city");
    const billingCityContainer = document.getElementById(
      "CurieRO-billing-city-container"
    );

    if (billingCityInput && !billingCityContainer) {
      const container = document.createElement("div");
      container.id = "CurieRO-billing-city-container";

      if (storeCartData.billingAddress.country === "RO") {
        billingCityInput.parentNode.insertBefore(
          container,
          billingCityInput.nextSibling
        );

        const root = createRoot(container);
        billingCityInput.setAttribute("type", "hidden");

        billingCityInput.parentNode
          .querySelector("label")
          .classList.add("CurieRO-select__label");

        root.render(
          <>
            <BillingCitySelect initialData={storeCartData.billingAddress} />
          </>
        );
      }
    }
  };

  useEffect(() => {
    renderShippingCitySelector();
  }, [document.querySelector("#shipping-city")]);

  useEffect(() => {
    renderBillingCitySelector();
  }, [document.querySelector("#billing-city")]);

  return <>External DOM</>;
}

export default ExternalDOMManipulation;
