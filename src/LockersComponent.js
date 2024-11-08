import SamedayLockers from "./lockersComponents/SamedayLockers";
import FancourierLockers from "./lockersComponents/FancourierLockers";
import MyGlsLockers from "./lockersComponents/MyGlsLockers";
import FancourierCollectPoints from "./lockersComponents/FancourierCollectPoints";
import CargusLockers from "./lockersComponents/CargusLockers";
import DpdLockers from "./lockersComponents/DpdLockers";
import InnoshipLockers from "./lockersComponents/InnoshipLockers";

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

  if (rateId === "urgentcargus_courier_ship_and_go") {
    return (
      <>
        <CargusLockers
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }
  if (rateId === "curiero_dpd_box") {
    return (
      <>
        <DpdLockers
          orderId={orderId}
          cartData={cartData}
          shippingRates={shippingRates}
        />
      </>
    );
  }
  if (rateId === "curiero_innoship_locker") {
    return (
      <>
        <InnoshipLockers
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
