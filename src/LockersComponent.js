import { useEffect, useState } from "@wordpress/element";

function LockersComponent({rateId}) {

	if(rateId === "curiero_sameday_lockers"){

		const lockers = [ ...curieroBlocks.sameday.lockers ];

		console.log(lockers);

		useEffect(() => {
			const selectElement = jQuery('.locker-select');

			selectElement.select2();

			return ()=>{
				selectElement.select2('destroy');
			}
		}, []);

		
		return (
		  <div>
			<div className="wc-block-components-checkout-step__heading"><h2 className="wc-block-components-title wc-block-components-checkout-step__title" aria-hidden="true">Alege punct EasyBox *</h2></div>
		 
		 
			<select className="locker-select" style={{display: "none", width: "100%", background: "#fff"}} id="curiero_sameday_lockers_select" name="curiero_sameday_lockers">
				{
					lockers.map(locker => (<option key={locker.key} value={locker.key} >{locker.value}</option>))
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
