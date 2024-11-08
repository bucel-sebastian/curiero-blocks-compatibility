/**
 * External dependencies
 */
import { defaultAddressFields, getSetting } from "@woocommerce/settings";
import { useCallback } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";
import { CHECKOUT_STORE_KEY } from "@woocommerce/block-data";

/**
 * Internal dependencies
 */

import { useShippingData } from "./shipping/useShippingData";
import { useCustomerData } from "./useCustomerData";

/**
 * Custom hook for exposing address related functionality for the checkout address form.
 */
export const useCheckoutAddress = () => {
  const { needsShipping } = useShippingData();
  const { useShippingAsBilling, prefersCollection } = useSelect((select) => ({
    useShippingAsBilling: select(CHECKOUT_STORE_KEY).getUseShippingAsBilling(),
    prefersCollection: select(CHECKOUT_STORE_KEY).prefersCollection(),
  }));
  const { __internalSetUseShippingAsBilling } = useDispatch(CHECKOUT_STORE_KEY);
  const {
    billingAddress,
    setBillingAddress,
    shippingAddress,
    setShippingAddress,
  } = useCustomerData();

  const setEmail = useCallback(
    (value) =>
      void setBillingAddress({
        email: value,
      }),
    [setBillingAddress]
  );

  const forcedBillingAddress = getSetting("forcedBillingAddress", false);

  return {
    shippingAddress,
    billingAddress,
    setShippingAddress,
    setBillingAddress,
    setEmail,
    defaultAddressFields,
    useShippingAsBilling,
    setUseShippingAsBilling: __internalSetUseShippingAsBilling,
    needsShipping,
    showShippingFields:
      !forcedBillingAddress && needsShipping && !prefersCollection,
    showShippingMethods: needsShipping && !prefersCollection,
    showBillingFields:
      !needsShipping || !useShippingAsBilling || !!prefersCollection,
    forcedBillingAddress,
    useBillingAsShipping: forcedBillingAddress || !!prefersCollection,
  };
};
