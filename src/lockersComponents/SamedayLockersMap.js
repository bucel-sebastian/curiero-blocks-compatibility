import { useRef, useState } from "@wordpress/element";

function SamedayLockersMap({ cartData, onLockerSelected }) {
  const samedayLockersMapInstance = useRef(null);
  const [samedayLockersMapMsg, setSamedayLockersMapMsg] = useState(null);
  //   const [
  //     samedayLockersMapInstanceLoading,
  //     setSamedayLockersMapInstanceLoading,
  //   ] = useState(true);

  const initSamedayLockersMap = () => {
    const options = {
      clientId: curieroBlocks.sameday.lockersMapClientId,
      countryCode:
        cartData.shippingAddress?.country ?? cartData.billingAddress?.country,
      langCode:
        cartData.shippingAddress?.country.toLowerCase() ??
        cartData.billingAddress?.country.toLowerCase(),
      city: cartData.shippingAddress?.city ?? cartData.billingAddress?.city,
    };

    window.LockerPlugin.init(options);
    return window.LockerPlugin.getInstance();
  };

  const reinitSamedayLockersMap = () => {
    const options = {
      clientId: curieroBlocks.sameday.lockersMapClientId,
      countryCode:
        cartData.shippingAddress?.country ?? cartData.billingAddress?.country,
      langCode:
        cartData.shippingAddress?.country.toLowerCase() ??
        cartData.billingAddress?.country.toLowerCase(),
      city: cartData.shippingAddress?.city ?? cartData.billingAddress?.city,
    };
    samedayLockersMapInstance.current.reinitializePlugin(options);
  };

  const handleOpenSamedayLockersMap = async (e) => {
    e.preventDefault();

    if (samedayLockersMapInstance.current === null) {
      samedayLockersMapInstance.current = initSamedayLockersMap();
    } else {
      reinitSamedayLockersMap();
    }

    if (
      samedayLockersMapInstance.current?.lockerPluginService?.elements?.iframe
    ) {
      const iframe =
        samedayLockersMapInstance.current.lockerPluginService.elements.iframe;
      const iframe_current_src = new URL(iframe.src);
      const updates = {
        city: cartData.shippingAddress?.city ?? cartData.billingAddress?.city,
        countryCode:
          cartData.shippingAddress?.country ?? cartData.billingAddress?.country,
        langCode:
          cartData.shippingAddress?.country.toLowerCase() ??
          cartData.billingAddress?.country.toLowerCase(),
      };

      let updated = false;
      Object.entries(updates).forEach(([key, value]) => {
        if (iframe_current_src.searchParams.get(key) !== value) {
          iframe_current_src.searchParams.set(key, value);
          updated = true;
        }
      });

      if (updated) {
        iframe.src = iframe_current_src.toString();
      }
    }
    samedayLockersMapInstance.current.subscribe(handleSamedayLockersMapSelect);
    samedayLockersMapInstance.current.open();
  };

  const handleSamedayLockersMapSelect = (msg) => {
    console.log(msg);
    onLockerSelected(msg);
    samedayLockersMapInstance.current.close();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenSamedayLockersMap}
        className="CurieRO-show-lockers-map-btn"
      >
        {curieroBlocks.i18n.selectLockerMapButton.sameday}
      </button>
    </div>
  );
}

export default SamedayLockersMap;
