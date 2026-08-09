import { IoSearch, IoArrowForward} from "react-icons/io5";

export function Navbar() {
    return (
        <div className="navbar">
            <h1 className="logo">Learn With Lyrics</h1>
            
            <div className="language-select">
                <select className="select">
                    <option value="Chinese">Chinese</option>
                </select>
            </div>
            

            <IoSearch className="large-icons"
                height="1000px"
                width="1000px"
            />

            <div className="current-langs">
                <img className="flag" src="/flags/china_flag.png"></img>
                <IoArrowForward className="large-icons" />
                <img className="flag" src="/flags/uk_flag.png"></img>
            </div>
        </div>
    )
}