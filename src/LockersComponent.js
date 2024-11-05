import SamedayLockers from "./lockersComponents/SamedayLockers";
import FancourierLockers from "./lockersComponents/FancourierLockers";
import MyGlsLockers from "./lockersComponents/MyGlsLockers";
import FancourierCollectPoints from "./lockersComponents/FancourierCollectPoints";

function LockersComponent({ rateId, orderId, cartData, shippingRates }) {
  if (rateId === "curiero_sameday_lockers") {
    return (
      <>
        <SamedayLockers
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }

  if (rateId === "curiero_fan_fanbox") {
    return (
      <>
        <FancourierLockers
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }
  if (rateId === "curiero_fan_collectpoint") {
    return (
      <>
        <FancourierCollectPoints
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }

  if (rateId === "curiero_mygls_box") {
    return (
      <>
        <MyGlsLockers
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }

  return <></>;
}

export default LockersComponent;
