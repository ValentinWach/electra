import BatchUploadC from "../../components/page-elements/Admin/BatchUploadC";
import GenerateTokenC from "../../components/page-elements/Admin/GenerateTokenC";
import RecalculateResultsC from "../../components/page-elements/Admin/RecalculateResultsC";

export default function Admin() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 w-2/3">
      <GenerateTokenC />
      <RecalculateResultsC />
      <BatchUploadC />
    </div>
  );
}