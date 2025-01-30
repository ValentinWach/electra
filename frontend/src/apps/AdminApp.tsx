import { Navigate, Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Admin from "../pages/admin/Admin";
import { adminPrefix } from "../constants/PathPrefixes";

export default function AdminApp() {
    return (
        <main className={"flex-grow p-10 flex flex-col items-center h-screen overflow-auto bg-gray-50"}>
            <Routes>
                <Route path="start" element={<Admin />} />
                <Route path="/*" element={<Navigate to={adminPrefix + "/start"} replace />} />
            </Routes>
        </main>
    );
}	