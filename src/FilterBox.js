import { useState } from "react";
import "./FilterBox.css"

export default function FilterBox({toggleRefresh}){
    const [toggleStatus, setToggleStatus] = useState(false)

    return (
        <div className="filter-box-container">
            <button className="filter-toggle-button" onClick={() => setToggleStatus(!toggleStatus)} title="Filter markers"><i className="fa-solid fa-filter" /></button>
            <button className="filter-toggle-button" onClick={() => toggleRefresh()} title="Refresh status"><i className="fa-solid fa-refresh" /></button>
            {toggleStatus && <div className="filter-boxes">
                TYPES, AVAILABILITY, FUEL LEVEL, SEATS
                </div>}
        </div>
    )
}