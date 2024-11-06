import { useEffect, useRef, useState, createRoot } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { useDispatch } from "@wordpress/data";
import ShippingCitySelect from "./city-select-components/ShippingCitySelect";
import BillingCitySelect from "./city-select-components/BillingCitySelect";

function ExternalDOMManipulation() {
  const dispatchCart = useDispatch("wc/store/cart");
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
    // const shippingCityContainer = document.getElementById(
    //   "CurieRO-shipping-city-container"
    // );

    const container =
      document.getElementById("CurieRO-shipping-city-container") ??
      document.createElement("div");
    container.id = "CurieRO-shipping-city-container";

    if (!shippingCityInput.parentNode.contains(container)) {
      shippingCityInput.parentNode.insertBefore(
        container,
        shippingCityInput.nextSibling
      );
    }
    const root = createRoot(container);

    if (storeCartData.shippingAddress.country === "RO") {
      if (
        shippingCityInput
        // && !shippingCityContainer
      ) {
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
    } else {
      shippingCityInput.setAttribute("type", "text");

      shippingCityInput.parentNode
        .querySelector("label")
        .classList.remove("CurieRO-select__label");

      root.unmount();
      container.remove();
      dispatchCart.setShippingAddress({
        city: "",
      });
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
    // const billingCityContainer = document.getElementById(
    //   "CurieRO-billing-city-container"
    // );

    const container =
      document.getElementById("CurieRO-billing-city-container") ??
      document.createElement("div");
    container.id = "CurieRO-billing-city-container";

    if (!billingCityInput.parentNode.contains(container)) {
      billingCityInput.parentNode.insertBefore(
        container,
        billingCityInput.nextSibling
      );
    }
    const root = createRoot(container);

    if (storeCartData.billingAddress.country === "RO") {
      if (
        billingCityInput
        // && !billingCityContainer
      ) {
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
    } else {
      billingCityInput.setAttribute("type", "text");

      billingCityInput.parentNode
        .querySelector("label")
        .classList.remove("CurieRO-select__label");

      root.unmount();
      container.remove();
      dispatchCart.setBillingAddress({
        city: "",
      });

      if (curieroBlocks.shippingDest === "billing_only") {
        dispatchCart.setShippingAddress({
          city: "",
        });
      }
    }

    return () => {
      if (root) {
        root.unmount();
      }
      container.remove();
    };
  };

  useEffect(() => {
    renderShippingCitySelector();
  }, [
    document.querySelector("#shipping-city"),
    storeCartData.shippingAddress.country,
  ]);

  useEffect(() => {
    renderBillingCitySelector();
  }, [
    document.querySelector("#billing-city"),
    storeCartData.billingAddress.country,
  ]);

  return <>External DOM</>;
}

export default ExternalDOMManipulation;
