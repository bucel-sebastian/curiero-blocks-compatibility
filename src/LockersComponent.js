import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from '@wordpress/data';
import { useSelect } from '@wordpress/data';
import {extensionCartUpdate} from '@wordpress/blocks-checkout';


function LockersComponent({rateId}) {
	const [selectedLocker, setSelectedLocker] = useState('');
	const dispatch = useDispatch();

	const orderId = useSelect((select) => {
        const order = select('wc/store/checkout'); // Adjust this based on your data store

		console.log(order);
		console.log(order.getOrderId());
		const orderId = order.getOrderId();

        return orderId; // Return the order ID or null if not available
    }, []);

	

	if(rateId === "curiero_sameday_lockers"){


		const lockers = [ ...curieroBlocks.sameday.lockers ];

		console.log(lockers);

		useEffect(() => {
			const selectElement = jQuery('.locker-select');

			selectElement.select2();

			selectElement.on('change', function () {
				const lockerValue = jQuery(this).val();
                setSelectedLocker(lockerValue);
				extensionCartUpdate({
					namespace: "curiero-blocks-namespace",
					data: {
						order_id: orderId,
						locker: lockerValue
					}

				}
				).then( () => {
					console.log("updated");
				} ).catch( ( error ) => {
					console.error(error );
					// Handle error.
					// processErrorResponse(error);
				} );
			})

			return ()=>{
				selectElement.select2('destroy');
				selectElement.off('change');
			}
		}, []);

		
		return (
		  <div>
			<div className="wc-block-components-checkout-step__heading"><h2 className="wc-block-components-title wc-block-components-checkout-step__title" aria-hidden="true">Alege punct EasyBox *</h2></div>
		 
		 
			<select className="locker-select" style={{display: "none", width: "100%", background: "#fff"}} id="curiero_sameday_lockers_select" name="curiero_sameday_lockers">
				{
					lockers.map(locker => (<option key={locker.id} value={locker.id} >{locker.name} - {locker.address}, {locker.city}, {locker.county}</option>))
				}
			</select>

			{
				curieroBlocks.sameday.lockersMap ? 
				<>
					<button type="button" id="sameday_map_btn" style={{padding: "10px", fontSize: "15px", width: "100%", marginTop: "15px"}}>Button de lockere</button>
				</> : 
				<></>
			}
		  </div>
		)
	}

	return <></>;
}

export default LockersComponent
