import { useEffect, useRef, useState, createRoot } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import Select from "react-select";
import { useDispatch } from "@wordpress/data";

function ShippingCitySelect({ initialData }) {
  const dispatchCart = useDispatch("wc/store/cart");

  const [initialShippingAddress, setInitialShippingAddress] = useState({
    ...initialData,
  });
  const [selectedCity, setSelectedCity] = useState(initialData.city);
  const [citySelectInputOptions, setCitySelectInputOptions] = useState([]);
  const [citySelectInputDisabled, setCitySelectInputDisabled] = useState(true);

  const storeCartData = useSelect((select) => {
    const store = select("wc/store/cart");
    const cartData = store.getCartData();

    return cartData;
  });

  const storeCheckoutData = useSelect((select) => {
    const store = select("wc/store/checkout");
    const checkoutData = store.getCheckoutData();

    console.log("Checkout data - ", checkoutData);

    return checkoutData;
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
      storeCartData.shippingAddress.state &&
      storeCartData.shippingAddress.state !== "" &&
      storeCartData.shippingAddress.country &&
      storeCartData.shippingAddress.country !== ""
    ) {
      if (
        initialShippingAddress.state !== storeCartData.shippingAddress.state ||
        initialShippingAddress.country !== storeCartData.shippingAddress.country
      ) {
        setSelectedCity("");
        dispatchCart.setShippingAddress({
          city: "",
        });
      }

      setInitialShippingAddress((prev) => ({
        ...prev,
        state: storeCartData.shippingAddress.state,
        country: storeCartData.shippingAddress.country,
      }));

      getCitySelectOptions(
        storeCartData.shippingAddress.state,
        storeCartData.shippingAddress.country
      );
    }
  }, [
    storeCartData.shippingAddress.state,
    storeCartData.shippingAddress.country,
  ]);

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption.value);

    dispatchCart.setShippingAddress({
      city: selectedOption.value,
    });
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

export default ShippingCitySelect;
