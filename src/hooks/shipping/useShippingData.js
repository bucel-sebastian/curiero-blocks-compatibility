/**
 * External dependencies
 */
import {
  CART_STORE_KEY as storeKey,
  processErrorResponse,
} from "@woocommerce/block-data";
import { useSelect, useDispatch } from "@wordpress/data";
import { isObject } from "@woocommerce/types";
import { useEffect, useRef, useCallback } from "@wordpress/element";
import {
  hasCollectableRate,
  deriveSelectedShippingRates,
} from "@woocommerce/base-utils";
import isShallowEqual from "@wordpress/is-shallow-equal";
import { previewCart } from "@woocommerce/resource-previews";
import { useStoreEvents } from "../useStoreEvents";

/**
 * Internal dependencies
 */

export const useShippingData = () => {
  const {
    shippingRates,
    needsShipping,
    hasCalculatedShipping,
    isLoadingRates,
    isCollectable,
    isSelectingRate,
  } = useSelect((select) => {
    const isEditor = !!select("core/editor");
    const store = select(storeKey);
    const rates = isEditor
      ? previewCart.shipping_rates
      : store.getShippingRates();
    return {
      shippingRates: rates,
      needsShipping: isEditor
        ? previewCart.needs_shipping
        : store.getNeedsShipping(),
      hasCalculatedShipping: isEditor
        ? previewCart.has_calculated_shipping
        : store.getHasCalculatedShipping(),
      isLoadingRates: isEditor ? false : store.isCustomerDataUpdating(),
      isCollectable: rates.every(({ shipping_rates: packageShippingRates }) =>
        packageShippingRates.find(({ method_id: methodId }) =>
          hasCollectableRate(methodId)
        )
      ),
      isSelectingRate: isEditor ? false : store.isShippingRateBeingSelected(),
    };
  });

  // set selected rates on ref so it's always current.
  const selectedRates = useRef({});
  useEffect(() => {
    const derivedSelectedRates = deriveSelectedShippingRates(shippingRates);
    if (
      isObject(derivedSelectedRates) &&
      !isShallowEqual(selectedRates.current, derivedSelectedRates)
    ) {
      selectedRates.current = derivedSelectedRates;
    }
  }, [shippingRates]);

  const { selectShippingRate: dispatchSelectShippingRate } =
    useDispatch(storeKey);

  const hasSelectedLocalPickup = hasCollectableRate(
    Object.values(selectedRates.current).map((rate) => rate.split(":")[0])
  );

  // Selects a shipping rate, fires an event, and catches any errors.
  const { dispatchCheckoutEvent } = useStoreEvents();
  const selectShippingRate = useCallback(
    (newShippingRateId, packageId) => {
      let selectPromise;

      if (typeof newShippingRateId === "undefined") {
        return;
      }

      /**
       * Picking location handling
       *
       * Forces pickup location to be selected for all packages since we don't allow a mix of shipping and pickup.
       */
      if (hasCollectableRate(newShippingRateId.split(":")[0])) {
        selectPromise = dispatchSelectShippingRate(newShippingRateId, null);
      } else {
        selectPromise = dispatchSelectShippingRate(
          newShippingRateId,
          packageId
        );
      }
      selectPromise
        .then(() => {
          dispatchCheckoutEvent("set-selected-shipping-rate", {
            shippingRateId: newShippingRateId,
          });
        })
        .catch((error) => {
          processErrorResponse(error);
        });
    },
    [dispatchSelectShippingRate, dispatchCheckoutEvent]
  );

  return {
    isSelectingRate,
    selectedRates: selectedRates.current,
    selectShippingRate,
    shippingRates,
    needsShipping,
    hasCalculatedShipping,
    isLoadingRates,
    isCollectable,
    hasSelectedLocalPickup,
  };
};