import { useEffect, useRef, useState, createRoot } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import Select from "react-select";
import { useDispatch } from "@wordpress/data";

function BillingCitySelect({ initialData }) {
  const dispatchCart = useDispatch("wc/store/cart");

  const [initialBillingAddress, setInitialBillingAddress] = useState({
    ...initialData,
  });
  const [selectedCity, setSelectedCity] = useState(initialData.city);
  const [citySelectInputOptions, setCitySelectInputOptions] = useState([]);
  const [citySelectInputDisabled, setCitySelectInputDisabled] = useState(true);

  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");
    console.log("cart data ", store);
    const cartData = store.getCartData();

    console.log("cart data ", cartData);

    return cartData;
  });

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

      const options = [];

      body.data.forEach((option) => {
        options.push({ value: option, label: option });
      });
      setSelectedCity("");
      setCitySelectInputOptions(options);
    }
  };

  useEffect(() => {
    if (citySelectInputOptions.length !== 0) {
      setCitySelectInputDisabled(false);
    } else {
      setCitySelectInputDisabled(true);
    }
  }, [citySelectInputOptions]);

  useEffect(() => {
    if (
      storeCartData.billingAddress.state &&
      storeCartData.billingAddress.state !== "" &&
      storeCartData.billingAddress.country &&
      storeCartData.billingAddress.country !== ""
    ) {
      if (
        initialBillingAddress.state !== storeCartData.billingAddress.state ||
        initialBillingAddress.country !== storeCartData.billingAddress.country
      ) {
        setSelectedCity("");
        dispatchCart.setBillingAddress({
          city: "",
        });
      }

      setInitialBillingAddress((prev) => ({
        ...prev,
        state: storeCartData.billingAddress.state,
        country: storeCartData.billingAddress.country,
      }));

      getCitySelectOptions(
        storeCartData.billingAddress.state,
        storeCartData.billingAddress.country
      );
    }
  }, [
    storeCartData.billingAddress.state,
    storeCartData.billingAddress.country,
  ]);

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);

    dispatchCart.setBillingAddress({
      city: selectedOption.value,
    });
    if (curieroBlocks.shippingDest === "billing_only") {
      dispatchCart.setShippingAddress({
        city: selectedOption.value,
      });
    }
  };

  return (
    <>
      <Select
        unstyled
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            height: "max-content",
          }),
          input: (baseStyles) => ({
            ...baseStyles,
            height: "auto",
          }),
        }}
        value={citySelectInputOptions.find(
          (option) => option.value === selectedCity
        )}
        onChange={handleCityChange}
        options={citySelectInputOptions}
        placeholder={
          citySelectInputDisabled
            ? curieroBlocks.i18n.citySelectLoader
            : curieroBlocks.i18n.citySelectDefault
        }
        className="CurieRO-select__container"
        classNamePrefix="CurieRO-select"
        isDisabled={citySelectInputDisabled}
      />
    </>
  );
}

export default BillingCitySelect;
