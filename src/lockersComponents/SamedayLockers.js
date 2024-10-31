import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { useSelect } from "@wordpress/data";
import { extensionCartUpdate } from "@wordpress/blocks-checkout";
import { CART_STORE_KEY } from "@woocommerce/block-data";

function SamedayLockers({ orderId, cartData, shippingRates }) {
  const [lockersAreLoading, setLockersAreLoading] = useState(false);

  // const [selectedLocker, setSelectedLocker] = useState("");

  const dispatchCart = useDispatch(CART_STORE_KEY);

  const handleLockerSelectorChange = async (lockerData) => {
    // setSelectedLocker(lockerData.id);

    await dispatchCart.applyExtensionCartUpdate({
      namespace: "CurieRO-blocks",
      data: {
        action: "sameday-set-selected-locker",
        order_id: orderId,
        locker: lockerData,
      },
    });
  };

  const [lockers, setLockers] = useState([]);

  useEffect(() => {
    setLockers(cartData?.extensions?.["CurieRO-blocks"]?.samedayLockers || []);

    const selectElement = jQuery(".locker-select");

    selectElement.select2();

    selectElement.on("change", async function () {
      const lockerId = jQuery(this).val();
      const lockerData = lockers.find((locker) => locker.id === lockerId);

      handleLockerSelectorChange(lockerData);
    });

    return () => {
      selectElement.select2("destroy");
      selectElement.off("change");
    };
  }, []);

  const getLockers = async (city, state, country) => {
    const formData = new FormData();
    formData.append("action", "curiero_get_lockers");
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

    setLockers(data.data.lockers);
    setLockersAreLoading(false);
  };

  useEffect(() => {
    setLockersAreLoading(true);
    getLockers(
      cartData.shippingAddress.CurieRO_city,
      cartData.shippingAddress.state,
      cartData.shippingAddress.country
    );
  }, [
    cartData.shippingAddress.CurieRO_city,
    cartData.shippingAddress.state,
    cartData.shippingAddress.country,
  ]);

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

      <select
        className="locker-select"
        style={{ display: "none", width: "100%", background: "#fff" }}
        id="curiero_sameday_lockers_select"
        name="curiero_sameday_lockers"
      >
        <option
          disabled
          selected={
            cartData?.extensions?.["CurieRO-blocks"] &&
            cartData?.extensions?.["CurieRO-blocks"]?.samedaySelectedLocker
          }
        >
          {curieroBlocks.i18n.selectLockerPlaceholder}
        </option>
        {lockers.map((locker) => (
          <option
            key={locker.id}
            value={locker.id}
            selected={
              cartData?.extensions?.["CurieRO-blocks"]?.samedaySelectedLocker
                ?.id === locker.id
            }
          >
            {locker.name} - {locker.address}, {locker.city}, {locker.county}
          </option>
        ))}
      </select>

      {curieroBlocks?.sameday?.lockersMap ? (
        <>
          <button
            type="button"
            id="sameday_map_btn"
            style={{
              padding: "10px",
              fontSize: "15px",
              width: "100%",
              marginTop: "15px",
            }}
          >
            {curieroBlocks.i18n.selectLockerMapButton.sameday}
          </button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default SamedayLockers;
