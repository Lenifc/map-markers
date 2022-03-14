import { useEffect, useState } from "react";
import "./FilterBox.css"

export default function FilterBox({toggleRefresh, filterValues}){
    const [toggleStatus, setToggleStatus] = useState(false)
    const [filterOptions, setFilterOptions] = useState({
        showParkings: true,
        showVehicles: true,
        showReservedVehicles: true,
        showAvailableVehicles: true,
        useFuelFilter: false,
        fuelLevel: 40,
        useSeatsFilter: false,
        availableSeats: 2
    })

    useEffect(() => {
        filterValues(filterOptions)
    }, [filterOptions])

    return (
        <div className="filter-box-container">
            <button className="filter-toggle-button" onClick={() => setToggleStatus(!toggleStatus)} title="Filter markers"><i className="fa-solid fa-filter" /></button>
            <button className="filter-toggle-button" onClick={() => toggleRefresh()} title="Refresh status"><i className="fa-solid fa-refresh" /></button>
            {toggleStatus && <div className="filter-boxes">
                    <div className="close-filter-section" onClick={() => setToggleStatus(false)}>&times;</div> 
                    <div className="filter-section">
                        <h4>Markers type:</h4>
                        <div><input type='checkbox' defaultChecked={filterOptions.showParkings} onChange={(e) => setFilterOptions({...filterOptions, showParkings: Boolean(e.target.checked)})}/>Parkings</div>
                        <div><input type='checkbox' defaultChecked={filterOptions.showVehicles} onChange={(e) => setFilterOptions({...filterOptions, showVehicles: Boolean(e.target.checked)})}/>Vehicles</div>
                    </div>
                    <div className="filter-section"> 
                        <h4>Availability:</h4>
                        <div><input type='checkbox' defaultChecked={filterOptions.showReservedVehicles} onChange={(e) => setFilterOptions({...filterOptions, showReservedVehicles: Boolean(e.target.checked)})}/>Reserved</div>
                        <div><input type='checkbox' defaultChecked={filterOptions.showAvailableVehicles} onChange={(e) => setFilterOptions({...filterOptions, showAvailableVehicles: Boolean(e.target.checked)})}/>Available</div>
                    </div>
                    <div className="filter-section"> 
                        <h4>Vehicle parameters:</h4>
                        <div>
                            <input type='checkbox' defaultChecked={filterOptions.useFuelFilter} onChange={(e) => setFilterOptions({...filterOptions, useFuelFilter: e.target.checked})}/>
                             <input type='range' min="10" max="100" step="5" defaultValue={filterOptions.fuelLevel} disabled={!filterOptions.useFuelFilter}
                                    onChange={(e) => setFilterOptions({...filterOptions, fuelLevel: e.target.value})}/>
                                    Minumum fuel level{filterOptions.useFuelFilter && `: (${filterOptions.fuelLevel})%`}
                        </div>
                        <div>
                            <input type='checkbox' defaultChecked={filterOptions.useSeatsFilter} onChange={(e) => setFilterOptions({...filterOptions, useSeatsFilter: e.target.checked})}/>
                             <input type='range' min="2" max="9" step="1" defaultValue={filterOptions.availableSeats} disabled={!filterOptions.useSeatsFilter}
                                    onChange={(e) => setFilterOptions({...filterOptions, availableSeats: e.target.value})}/>
                                    Minumum seats{filterOptions.useSeatsFilter && `: (${filterOptions.availableSeats})`}
                        </div>
                    </div>
                </div>}
        </div>
    )
}