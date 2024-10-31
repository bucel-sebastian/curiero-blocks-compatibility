import useCurieROExternalShippingCitySelectPopulate from "./hooks/useCurieROExternalShippingCitySelectPopulate";
import useCurieROExternalBillingCitySelectPopulate from "./hooks/useCurieROExternalBillingCitySelectPopulate";
import { useEffect, useRef, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";

function ExternalDOMManipulation() {
  const shippingCitySelectPopulate =
    useCurieROExternalShippingCitySelectPopulate();

  const billingCitySelectPopulate =
    useCurieROExternalBillingCitySelectPopulate();

  return <>External DOM</>;
}

export default ExternalDOMManipulation;
