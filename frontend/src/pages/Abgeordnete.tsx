import {fetchAbgeordnete} from "../apiServices.ts";
import AbgeordneteC from "../components/AbgeordneteC.tsx";

export default function Abgeordnete() {
    return (
        <div className={"flex flex-col items-center"}>
            <AbgeordneteC fetchAbgeordnete={fetchAbgeordnete}/>
        </div>
    )
}