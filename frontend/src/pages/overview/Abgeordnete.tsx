import {fetchAbgeordnete} from "../../apiServices.ts";
import AbgeordneteC from "../../components/page-elements/Abgeordnete/AbgeordneteC.tsx";

export default function Abgeordnete() {
    return (
        <>
            <AbgeordneteC fetchAbgeordnete={fetchAbgeordnete}/>
        </>
    )
}