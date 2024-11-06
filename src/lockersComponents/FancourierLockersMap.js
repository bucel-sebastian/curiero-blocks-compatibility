import { useEffect, useRef } from "@wordpress/element";
import useFancourierCounties from "../hooks/useFancourierCounties";

function FancourierLockersMap({ cartData, onLockerSelected, isDisabled }) {
  const fanboxMapDiv = useRef(null);
  const fancourierCounties = useFancourierCounties(
    curieroBlocks.shippingDest === "billing_only"
      ? cartData.billingAddress.country
      : cartData.shippingAddress.country
  );

  const handleOpenFancourierLockersMap = async (e) => {
    e.preventDefault();

    if (fanboxMapDiv.current) {
      console.log(fanboxMapDiv.current);

      window.LoadMapFanBox({
        pickUpPoint: null,
        county: fancourierCounties.find(
          (county) => county[0] === cartData.shippingAddress.state
        )[1],
        locality: cartData.shippingAddress.city,
        rootNode: fanboxMapDiv.current,
      });
    }
  };

  const handleFancourierLockersMapSelect = (e) => {
    onLockerSelected(e.detail.item);
  };

  useEffect(() => {
    window.addEventListener(
      "map:select-point",
      handleFancourierLockersMapSelect,
      true
    );
    return () => {
      window.removeEventListener(
        "map:select-point",
        handleFancourierLockersMapSelect,
        true
      );
    };
  }, []);

  return (
    <div>
      <button
        type="button"
        className="CurieRO-show-lockers-map-btn"
        onClick={handleOpenFancourierLockersMap}
        disabled={isDisabled}
      >
        {curieroBlocks.i18n.selectLockerMapButton.fancourier}
      </button>
      <div ref={fanboxMapDiv}></div>
    </div>
  );
}

export default FancourierLockersMap;
