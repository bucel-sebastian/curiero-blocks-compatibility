import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { useSelect } from "@wordpress/data";
import { extensionCartUpdate } from "@wordpress/blocks-checkout";
import { CART_STORE_KEY } from "@woocommerce/block-data";

import Select from "react-select";
import SamedayLockersMap from "./SamedayLockersMap";
import useSamedayCounties from "../hooks/useSamedayCounties";

function SamedayLockers({ orderId, cartData, shippingRates }) {
  const [lockersAreLoading, setLockersAreLoading] = useState(false);

  const dispatchCart = useDispatch(CART_STORE_KEY);

  const samedayCounties = useSamedayCounties(
    curieroBlocks.shippingDest === "billing_only"
      ? cartData.billingAddress.country
      : cartData.shippingAddress.country
  );

  const [lockers, setLockers] = useState([]);

  const getLockers = async (city, state, country) => {
    const formData = new FormData();
    formData.append("action", "curiero_get_sameday_lockers");
    formData.append("nonce", curieroBlocks.nonce);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("country", country);

    const response = await fetch(curieroBlocks.ajaxurl, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    const data = await response.json();

    const lockersData = [];
    data.data.lockers.forEach((locker) => {
      lockersData.push({
        value: locker.id,
        label: `${locker.name} - ${locker.address}, ${locker.city}, ${locker.county}`,
        id: locker.id,
        name: locker.name,
        address: locker.address,
        city: locker.city,
        county: locker.county,
      });
    });

    setLockers(lockersData);
    setLockersAreLoading(false);
  };

  useEffect(() => {
    setLockersAreLoading(true);
    getLockers(
      cartData.shippingAddress.city,
      cartData.shippingAddress.state,
      cartData.shippingAddress.country
    );
  }, [
    cartData.shippingAddress.city,
    cartData.shippingAddress.state,
    cartData.shippingAddress.country,
  ]);

  const handleLockerChange = async (selectedOption) => {
    setLockersAreLoading(true);
    const lockerData = lockers.find(
      (locker) => locker.value === selectedOption.value
    );

    await dispatchCart.applyExtensionCartUpdate({
      namespace: "CurieRO-blocks",
      data: {
        action: "sameday-set-selected-locker",
        order_id: orderId,
        locker: lockerData,
      },
    });
    setLockersAreLoading(false);
  };

  const handleSelectLockerFromMap = async (selectedOption) => {
    setLockersAreLoading(true);
    const lockerData = lockers.find(
      (locker) => locker.value === selectedOption.lockerId.toString()
    );
    // Trebuie rectificat deoarece cauta doar in lockerele din zona
    await dispatchCart.applyExtensionCartUpdate({
      namespace: "CurieRO-blocks",
      data: {
        action: "sameday-set-selected-locker",
        order_id: orderId,
        locker: lockerData,
      },
    });

    // if (curieroBlocks.shippingDest === "billing_only") {
    //   await dispatchCart.setBillingAddress({
    //     city: selectedOption.city,
    //     state: samedayCounties.find(
    //       (county) => county[1] === selectedOption.county
    //     )[0],
    //   });
    //   await dispatchCart.setShippingAddress({
    //     city: selectedOption.city,
    //     state: samedayCounties.find(
    //       (county) => county[1] === selectedOption.county
    //     )[0],
    //   });
    // } else {
    //   await dispatchCart.setShippingAddress({
    //     city: selectedOption.city,
    //     state: samedayCounties.find(
    //       (county) => county[1] === selectedOption.county
    //     )[0],
    //   });
    // }

    setLockersAreLoading(false);
  };

  return (
    <div
      className={` ${
        lockersAreLoading ? "wc-block-components-loading-mask" : ""
      }`}
    >
      <div className="wc-block-components-checkout-step__heading">
        <h2
          className="wc-block-components-title wc-block-components-checkout-step__title"
          aria-hidden="true"
        >
          {curieroBlocks.i18n.selectLockerTitle.sameday} *
        </h2>
      </div>
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
        value={lockers.find(
          (locker) =>
            locker.value.toString() ===
            cartData?.extensions?.[
              "CurieRO-blocks"
            ]?.samedaySelectedLocker?.id.toString()
        )}
        onChange={handleLockerChange}
        options={lockers}
        placeholder={curieroBlocks.i18n.selectLockerPlaceholder}
        className="CurieRO-select-locker__container"
        classNamePrefix="CurieRO-select-locker"
        isDisabled={lockersAreLoading}
      />

      {curieroBlocks?.sameday?.lockersMap ? (
        <>
          <SamedayLockersMap
            cartData={cartData}
            onLockerSelected={handleSelectLockerFromMap}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default SamedayLockers;

const lockers = {
  id: 3680,
  fixedLocationId: "3680",
  name: "Auchan - Constanta Sud (acum sunt 6 celule libere)",
  fixedLocationTypeId: 1,
  serviceId: 3,
  courierId: 12,
  localityId: 4946,
  localityName: "Constanta",
  countyCode: "CT",
  countyName: "Constanta",
  countryCode: "RO",
  addressText: "Sos. Mangaliei nr. 195A",
  postalCode: "900082",
  lat: 44.1341165,
  long: 28.6228314,
  isActive: true,
  email: "",
  phone: null,
  supportedPaymentType: "None",
  allowsDropOff: false,
  schedule: [
    {
      day: 1,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 2,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 3,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 4,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 5,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 6,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
    {
      day: 7,
      openingHour: "07:00:00",
      closingHour: "22:00:00",
    },
  ],
  restrictions: null,
};
