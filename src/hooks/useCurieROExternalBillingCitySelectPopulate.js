import { useEffect, useRef, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { useDispatch } from "@wordpress/data";

const useCurieROExternalBillingCitySelectPopulate = () => {
  const [citySelectInputDisabled, setCitySelectInputDisabled] = useState(true);
  const [citySelectInputOptions, setCitySelectInputOptions] = useState([]);

  const dispatchCart = useDispatch("wc/store/cart");
  const dispatchCheckout = useDispatch("wc/store/checkout");

  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");

    return store.getCartData();
  });

  console.log(storeCartData);

  const handleCitySelectInputChange = async (value) => {
    dispatchCart.setBillingAddress({
      CurieRO_city: value,
    });
  };

  const changeCitySelectInputDisabledAttr = () => {
    if (
      storeCartData.billingAddress.state &&
      storeCartData.billingAddress.state !== ""
    ) {
      setCitySelectInputDisabled(false);
      return;
    }
    setCitySelectInputDisabled(true);
    return;
  };

  const getCitySelectOptions = async (state, country) => {
    setCitySelectInputDisabled(true);
    const formData = new FormData();
    formData.append("action", "curiero_get_cities_by_state");
    formData.append("nonce", curieroBlocks.nonce);
    formData.append("state", state);
    formData.append("country", country);

    const response = await fetch(curieroBlocks.ajaxurl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const body = await response.json();

      setCitySelectInputOptions([...body.data]);
    }
  };

  const populateCitySelect = (options) => {
    const element = document.querySelector("#billing-CurieRO-city");
    if (element) {
      const elementInnerHtmlDefault = `<option value="" data-alternate-values="[${curieroBlocks.i18n.citySelectDefault}]" disabled="" selected>${curieroBlocks.i18n.citySelectDefault}</option>`;
      const elementInnerHtmlOptions = options
        .map(
          (option) => `<option value="${option}">${option}
            </option>`
        )
        .join("");
      element.innerHTML = `${elementInnerHtmlDefault} ${elementInnerHtmlOptions}`;
    }
    setCitySelectInputDisabled(false);
  };

  useEffect(() => {
    if (!document.querySelector("#billing-CurieRO-city")) {
      return;
    }
    const selectCityElement = jQuery("#billing-CurieRO-city");
    selectCityElement.select2();

    selectCityElement.on("change", async function () {
      const cityValue = jQuery(this).val();
      handleCitySelectInputChange(cityValue);
    });

    return () => {
      selectCityElement.select2("destroy");
      selectCityElement.off("change");
    };
  }, [document.querySelector("#billing-CurieRO-city")]);

  useEffect(() => {
    if (document.querySelector("#billing-CurieRO-city")) {
      changeCitySelectInputDisabledAttr();
    }
  }, [
    document.querySelector("#billing-CurieRO-city"),
    storeCartData.billingAddress.state,
  ]);

  useEffect(() => {
    const element = document.querySelector("#billing-CurieRO-city");
    if (element) {
      if (citySelectInputDisabled) {
        element.setAttribute("disabled", true);
      } else {
        element.removeAttribute("disabled");
      }
    }
  }, [citySelectInputDisabled]);

  useEffect(() => {
    if (
      storeCartData.billingAddress.state &&
      storeCartData.billingAddress.state !== "" &&
      storeCartData.billingAddress.country &&
      storeCartData.billingAddress.country !== ""
    ) {
      getCitySelectOptions(
        storeCartData.billingAddress.state,
        storeCartData.billingAddress.country
      );
    }
  }, [
    storeCartData.billingAddress.state,
    storeCartData.billingAddress.country,
  ]);

  useEffect(() => {
    populateCitySelect(citySelectInputOptions);
  }, [citySelectInputOptions]);

  useEffect(() => {
    console.log("update ", storeCartData);
  }, [storeCartData]);

  return null;
};

export default useCurieROExternalBillingCitySelectPopulate;
