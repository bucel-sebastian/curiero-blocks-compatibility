import SamedayLockers from "./lockersComponents/SamedayLockers";

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

  return <></>;
}

export default LockersComponent;
