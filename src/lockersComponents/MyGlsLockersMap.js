import { useEffect, useRef, useState } from "@wordpress/element";
import useMyGlsCounties from "../hooks/useMyGlsCounties";

function MyGlsLockersMap({ cartData, onLockerSelected }) {
  useEffect(() => {
    const handleMapChange = (e) => {
      const selectedLocker = e.detail;

      onLockerSelected(selectedLocker);
    };

    const mapElement = document.querySelector(".gls-map-locker");
    if (mapElement) {
      mapElement.addEventListener("change", handleMapChange);
    }

    return () => {
      if (mapElement) {
        mapElement.removeEventListener("change", handleMapChange);
      }
    };
  }, []);

  const handleOpenMyGlsLockersMap = async (e) => {
    const selectedCountry =
      curieroBlocks.shippingDest === "billing_only"
        ? cartData.billingAddress.country
        : cartData.shippingAddress.country;

    const mapElement = document.querySelector(".gls-map-locker");
    if (mapElement) {
      mapElement.setAttribute("country", selectedCountry.toLowerCase());
      mapElement.showModal();
    }
  };

  const myglsCounties = useMyGlsCounties(
    curieroBlocks.shippingDest === "billing_only"
      ? cartData.billingAddress.country
      : cartData.shippingAddress.country
  );

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenMyGlsLockersMap}
        className="CurieRO-show-lockers-map-btn"
      >
        {curieroBlocks.i18n.selectLockerMapButton.mygls}
      </button>
    </div>
  );
}

export default MyGlsLockersMap;
